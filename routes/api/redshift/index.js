const express = require('express');

const router = express.Router();

const Redshift = require('node-redshift');

const clientConfiguration = {
  user: process.env.REDSHIFT_USER,
  database: process.env.REDSHIFT_DATABASE,
  password: process.env.REDSHIFT_PASSWORD,
  port: process.env.REDSHIFT_PORT,
  host: process.env.REDSHIFT_HOST,
};

const redshift = new Redshift(clientConfiguration, {rawConnection: true});

router.get('/test', (req, res) => {
  const redshift = new Redshift(clientConfiguration);
  const sql = 'select top 10 cs.clientCredNegotiation.* from cs.clientCredNegotiation';

  redshift.query(sql, { raw: true })
    .then((data) => {
      console.log(data);
      res.status(200).json(data);
      // if you want to close client pool, uncomment redshift.close() line
      // but you won't be able to make subsequent calls because connection is terminated
      redshift.close();
    }, (err) => {
      res.status(500).json(err);
      throw err;
    });
});

router.get('/connect_db', (req, res) => {
  redshift.connect((err) => {
    if (!err) {
      res.status(200).json('RedShift database connected successfully!');
    }else{
      res.status(500).json(err);
      throw err;
    }
  })
});

router.get('/disconnect_db', (req, res) => {
  redshift.close();
  res.status(200).json('RedShift database connection closed successfully!');
});

router.get('/create_temp_creditor_variables', (req, res) => {
  const sql = '\n' +
    'With Creditor_var_Calc as\n' +
    '(Select ccn.ClientCredID,ccn.ClientCredNegotiationID,UPPER(LTRIM(RTRIM(cr.name))) Creditor,  \n' +
    '\t\t\tROUND(ccn.Accepted_ratio, 2) Accepted_ratio,\n' +
    '\t\t\tss.Number_of_terms,\n' +
    '\t\t\tccn.OfferAmount, Total_Offer_Schedule_Amt,\n' +
    '\t\t\tmin_amount,\n' +
    '\t\t\tcast(round((ccn.OfferAmount/Number_of_terms)*0.95,0) as int) Monthly_payment_Calc,\n' +
    '\t\t\tcase when min_amount <= cast(round((ccn.OfferAmount/Number_of_terms)*0.95,0) as int) then cast(min_amount as varchar)\n' +
    '\t\t\t\t\telse \'evenpays\'\n' +
    '\t\t\t\t\tend Min_Monthly_Payment,\n' +
    '\t\t\tcc.OriginalDueDate, cc.DateEntered, ccn.NegotiationDate\n' +
    '\tfrom \n' +
    '\t\t\t\t\n' +
    '\t--To get last negotiation before first processed date\n' +
    '\t(Select clientCredNegotiationID,ccn.ClientCredID,ccn.Processed, ccn.NegotiationDate , round(ccn.OfferAmount,0) OfferAmount,\n' +
    '\t\t\t\t\tccn.OfferAmount/(case when ccn.BalanceAtTimeOfNegotiation=0 then 1 else ccn.BalanceAtTimeOfNegotiation end)   Accepted_ratio,\n' +
    '\t\t\t\t\tROW_NUMBER() over (Partition by ccn.ClientCredID order by NegotiationDate desc) is_latest\n' +
    '\t\t\tfrom  cs.clientCredNegotiation ccn\n' +
    '\t\t\tjoin (select min(changedate) as firstprocessdate, clientcredid, clientid \n' +
    '\t\t\t\t\t\t\tfrom cs.accountstatushistory (nolock)\n' +
    '     \t\t\t\t\t\twhere newstatus in (\'TERM SIF\')\n' +
    '      \t\t\t\t\t\tgroup by clientcredid, clientid) cc on ccn.ClientCredID = cc.ClientCredID and ccn.NegotiationDate <= firstprocessdate) ccn\n' +
    '\n' +
    '\t\t\t\t\n' +
    '\t--To get total # terms (payment terms) [CreditorPaymentNumber is <> 0 for creditor pays]\n' +
    '\tjoin (Select ss.ClientCredNegotiationID,max(ss.CreditorPaymentNumber) Number_of_terms , round(sum(ss.amount),0) Total_Offer_Schedule_Amt\n' +
    '\t\t\t\tfrom cs.SettlementSchedule ss\n' +
    '\t\t\t\tjoin cs.ProgramScheduleDebtor psd on psd.SettlementScheduleID = ss.SettlementScheduleID\t--413618\n' +
    '\t\t\t\twhere CreditorPaymentNumber <> 0\n' +
    '\t\t\t\tgroup by ss.ClientCredNegotiationID) ss on ss.ClientCredNegotiationID = ccn.ClientCredNegotiationID \n' +
    '\n' +
    '\t\t\t\t\n' +
    '\t--To get min of all scheduled creditor pays (excluding last scheuled pay)\n' +
    '\tleft join (Select ClientCredNegotiationID, cast(round(min(amount),0) as int) min_amount\n' +
    '\t\t\t\tfrom (Select ROW_NUMBER() over (partition by ss.ClientCredNegotiationID order by psd.DueDate desc ) is_last_pay ,ss.*\n' +
    '\t\t\t\t\t\tfrom cs.SettlementSchedule ss\n' +
    '\t\t\t\t\t\tjoin cs.ProgramScheduleDebtor psd on psd.SettlementScheduleID = ss.SettlementScheduleID\n' +
    '\t\t\t\t\t\twhere CreditorPaymentNumber <> 0 ) SS \n' +
    '\t\t\twhere is_last_pay <> 1 and ss.amount > 9.5 \n' +
    '\t\t\tgroup by ClientCredNegotiationID) mp on mp.ClientCredNegotiationID = ccn.ClientCredNegotiationID\n' +
    '\n' +
    '\tleft join cs.ClientCred cc on cc.ClientCredID = ccn.ClientCredID\n' +
    '\tleft Join cs.Creditors cr on cr.creditorID = cc.CreditorID\n' +
    '\n' +
    '\twhere ccn.is_latest=1 \n' +
    '\t\t\tand Number_of_terms is not null\n' +
    '\t\t\tand ccn.OfferAmount = Total_Offer_Schedule_Amt\t\t\t\t\t\n' +
    ') ,\n' +
    'Creditor_limit_Calc_below_180 as\n' +
    '(Select name,\n' +
    '\t\tcase when one_twenty >=5 then DATEADD(day,-120,getdate())\n' +
    '\t\t\t when two_fourty >=5 then DATEADD(day,-240,getdate())\n' +
    '\t\t\t else \'1/1/2000\' end Date_Limit\n' +
    'from (Select name,SUM(CASE when NegotiationDate > DATEADD(day,-120,getdate())\tTHEN 1 else 0 end) as one_twenty,\n' +
    '\t\t\t SUM(CASE when NegotiationDate > DATEADD(day,-240,getdate())\tTHEN 1 else 0 end) as two_fourty,\n' +
    '\t\t\t\t\t count(ccn.ClientCredNegotiationID) total\n' +
    '\t\tfrom (Select clientCredNegotiationID,ccn.ClientCredID,ccn.Processed, ccn.NegotiationDate , round(ccn.OfferAmount,0) OfferAmount,UPPER(LTRIM(RTRIM(cr.name))) as name,\n' +
    '\t\t\t\t\t\t\tccn.OfferAmount/(case when ccn.BalanceAtTimeOfNegotiation=0 then 1 else ccn.BalanceAtTimeOfNegotiation end)  Accepted_ratio,\n' +
    '\t\t\t\t\t\t\tROW_NUMBER() over (Partition by ccn.ClientCredID order by NegotiationDate desc) is_latest\n' +
    '\t\t\t\t\tfrom  cs.clientCredNegotiation ccn\n' +
    '\t\t\t\t\tjoin cs.ClientCred cc on cc.ClientCredID = ccn.ClientCredID\n' +
    '\t\t\t\t\tjoin cs.Creditors cr on cr.CreditorID = cc.CreditorID\n' +
    '\t\t\t\t\tjoin (select min(changedate) as firstprocessdate, clientcredid, clientid \n' +
    '\t\t\t\t\t\t\t\t\tfrom cs.accountstatushistory (nolock)\n' +
    '\t\t\t\t\t\t\t\t\twhere newstatus in (\'TERM SIF\')\n' +
    '\t\t\t\t\t\t\t\t\tgroup by clientcredid, clientid) ash on ccn.ClientCredID = ash.ClientCredID and ccn.NegotiationDate <= firstprocessdate\n' +
    '\t\t\t\t\twhere DATEDIFF(day, ISNULL(OriginalDueDate, cc.DateEntered),NegotiationDate) < 180) ccn\n' +
    '\n' +
    '\t\tjoin (Select ss.ClientCredNegotiationID, round(sum(ss.amount),0) Total_Offer_Schedule_Amt\n' +
    '\t\t\t\t\t\tfrom cs.SettlementSchedule ss\n' +
    '\t\t\t\t\t\tjoin cs.ProgramScheduleDebtor psd on psd.SettlementScheduleID = ss.SettlementScheduleID\t--413618\n' +
    '\t\t\t\t\t\twhere CreditorPaymentNumber <> 0\n' +
    '\t\t\t\t\t\tgroup by ss.ClientCredNegotiationID) ss on ss.ClientCredNegotiationID = ccn.ClientCredNegotiationID \n' +
    '\t\twhere is_latest = 1\n' +
    '\t\t\t and OfferAmount = Total_Offer_Schedule_Amt\n' +
    '\t\tgroup by name) cr1 \n' +
    '),\n' +
    'Creditor_limit_Calc_above_180 as\n' +
    '(Select name,\n' +
    '\t\tcase when one_twenty >=5 then DATEADD(day,-120,getdate())\n' +
    '\t\t\t when two_fourty >=5 then DATEADD(day,-240,getdate())\n' +
    '\t\t\t else \'1/1/2000\' end Date_Limit\n' +
    'from (Select name,SUM(CASE when NegotiationDate > DATEADD(day,-120,getdate())\tTHEN 1 else 0 end) as one_twenty,\n' +
    '\t\t\t SUM(CASE when NegotiationDate > DATEADD(day,-240,getdate())\tTHEN 1 else 0 end) as two_fourty,\n' +
    '\t\t\t\t\t count(ccn.ClientCredNegotiationID) total\n' +
    '\t\tfrom (Select clientCredNegotiationID,ccn.ClientCredID,ccn.Processed, ccn.NegotiationDate , round(ccn.OfferAmount,0) OfferAmount,UPPER(LTRIM(RTRIM(cr.name))) as name,\n' +
    '\t\t\t\t\t\t\tccn.OfferAmount/(case when ccn.BalanceAtTimeOfNegotiation=0 then 1 else ccn.BalanceAtTimeOfNegotiation end)  Accepted_ratio,\n' +
    '\t\t\t\t\t\t\tROW_NUMBER() over (Partition by ccn.ClientCredID order by NegotiationDate desc) is_latest\n' +
    '\t\t\t\t\tfrom  cs.clientCredNegotiation ccn\n' +
    '\t\t\t\t\tjoin cs.ClientCred cc on cc.ClientCredID = ccn.ClientCredID\n' +
    '\t\t\t\t\tjoin cs.Creditors cr on cr.CreditorID = cc.CreditorID\n' +
    '\t\t\t\t\tjoin (select min(changedate) as firstprocessdate, clientcredid, clientid \n' +
    '\t\t\t\t\t\t\t\t\tfrom cs.accountstatushistory (nolock)\n' +
    '\t\t\t\t\t\t\t\t\twhere newstatus in (\'TERM SIF\')\n' +
    '\t\t\t\t\t\t\t\t\tgroup by clientcredid, clientid) ash on ccn.ClientCredID = ash.ClientCredID and ccn.NegotiationDate <= firstprocessdate\n' +
    '\t\t\t\t\twhere DATEDIFF(day, ISNULL(OriginalDueDate, cc.DateEntered),NegotiationDate) >= 180) ccn\n' +
    '\n' +
    '\t\tjoin (Select ss.ClientCredNegotiationID, round(sum(ss.amount),0) Total_Offer_Schedule_Amt\n' +
    '\t\t\t\t\t\tfrom cs.SettlementSchedule ss\n' +
    '\t\t\t\t\t\tjoin cs.ProgramScheduleDebtor psd on psd.SettlementScheduleID = ss.SettlementScheduleID\t--413618\n' +
    '\t\t\t\t\t\twhere CreditorPaymentNumber <> 0\n' +
    '\t\t\t\t\t\tgroup by ss.ClientCredNegotiationID) ss on ss.ClientCredNegotiationID = ccn.ClientCredNegotiationID \n' +
    '\t\twhere is_latest = 1\n' +
    '\t\t\t and OfferAmount = Total_Offer_Schedule_Amt\n' +
    '\t\tgroup by name) cr1 ),\n' +
    'Accepted_ratio_pre_Charge as\n' +
    '(Select b.* from (Select *, ROW_NUMBER() OVER (Partition by  Creditor order by Number_Settlements desc, Accepted_Ratio desc) Is_Most_Acc_Ratio\n' +
    '\t\tfrom\t(Select cv.Creditor, cv.Accepted_Ratio, count(1) Number_Settlements\n' +
    '\t\t\t\t\tfrom Creditor_var_Calc cv\n' +
    '\t\t\t\t\tjoin Creditor_limit_Calc_below_180 cl on cl.Name = cv.Creditor\n' +
    '\t\t\t\t\twhere NegotiationDate > Date_Limit\t\n' +
    '\t\t\t\t\t\t and DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) < 180\n' +
    '\t\t\t\t\tgroup by Creditor,Accepted_Ratio) a ) b where Is_Most_Acc_Ratio = 1),\n' +
    'Accepted_ratio_post_Charge as\n' +
    '( Select b.* from (Select *, ROW_NUMBER() OVER (Partition by  Creditor order by Number_Settlements desc, Accepted_Ratio desc) Is_Most_Acc_Ratio\n' +
    '\t\t\tfrom (Select cv.Creditor, cv.Accepted_Ratio, count(1) Number_Settlements\n' +
    '\t\t\t\t\tfrom Creditor_var_Calc cv\n' +
    '\t\t\t\t\tjoin Creditor_limit_Calc_above_180 cl on cl.Name = cv.Creditor\n' +
    '\t\t\t\t\twhere NegotiationDate > Date_Limit\n' +
    '\t\t\t\t\t\tand DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) >= 180\t\n' +
    '\t\t\t\t\tgroup by Creditor,Accepted_Ratio) a ) b where Is_Most_Acc_Ratio = 1)\n' +
    '\n' +
    '\n' +
    'Select\tCOALESCE(cr1.Creditor,cr2.Creditor,cr3.Creditor,cr4.Creditor,cr5.Creditor,cr6.Creditor) Creditor, \n' +
    '\t\tcr1.Accepted_Ratio as Most_Accepted_Ratio_pre_charge , \n' +
    '\t\tcr2.Most_Accepted_Terms_pre_Charge, \n' +
    '\t\tcr3.Min_Monthly_Pay as Min_Monthly_Pay_pre_charge,\n' +
    '\t\tcr3.Total_Number_Settlements_pre_charge,\n' +
    '\t\t(Case when crb.Date_Limit=\'2000-01-01 00:00:00.000\' then\'All history\' \n' +
    '\t\t    when datediff(day,crb.Date_Limit,getdate())=120 then \'Last 120 days\'\n' +
    '\t\t\twhen datediff(day,crb.Date_Limit,getdate())=240 then \'Last 240 days\' end) DL_Pre,\n' +
    '\t\tcr4.Accepted_Ratio as Most_Accepted_Ratio_post_charge , \n' +
    '\t\tcr5.Most_Accepted_Terms_post_Charge, \n' +
    '\t\tcr6.Min_Monthly_Pay as Min_Monthly_Pay_post_charge,\n' +
    '\t\tcr6.Total_Number_Settlements_post_charge, \n' +
    '\t\t(Case when cra.Date_Limit=\'2000-01-01 00:00:00.000\' then\'All history\' \n' +
    '\t\t    when datediff(day,cra.Date_Limit,getdate())=120 then \'Last 120 days\'\n' +
    '\t\t\twhen datediff(day,cra.Date_Limit,getdate())=240 then \'Last 240 days\' end) DL_post\n' +
    '\t\t--(isnull(cr2.Total_Number_Settlements,0) + \tisnull(cr5.Total_Number_Settlements,0)) as Number_Settlements\n' +
    '\n' +
    '--drop table ##temp_Creditor_Variables\n' +
    'into ##temp_Creditor_Variables\n' +
    '\n' +
    'from Accepted_ratio_pre_Charge cr1\n' +
    '\n' +
    'full join (Select * from (Select creditor,Number_of_Terms as Most_Accepted_Terms_pre_Charge, Mode, \n' +
    '\t\t\t\t\t\t\t\tRow_NUmber() over (partition by creditor order by Mode desc,Number_Of_Terms desc) as Is_Max_Mode \n' +
    '\t\t\t\t\t\t from (Select cv.Creditor,Number_of_terms,count(1) as Mode\n' +
    '\t\t\t\t\t\t\t\t\tfrom Creditor_var_Calc cv\n' +
    '\t\t\t\t\t\t\t\t\tjoin Creditor_limit_Calc_below_180 cl on cl.Name = cv.Creditor\n' +
    '\t\t\t\t\t\t\t\t\tjoin Accepted_ratio_pre_Charge ar on ar.creditor = cv.Creditor and ar.Accepted_ratio = cv.Accepted_ratio\n' +
    '\t\t\t\t\t\t\t\t\twhere NegotiationDate > Date_Limit\n' +
    '\t\t\t\t\t\t\t\t\t\tand DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) < 180\n' +
    '\t\t\t\t\t\t\t\t\tgroup by cv.Creditor,Number_of_terms) a \n' +
    '\t\t\t\t\t\t ) b where b.Is_Max_Mode = 1)cr2 on cr2.Creditor = cr1.Creditor \n' +
    '\n' +
    'full join (Select Creditor,case when min (case when Min_Monthly_Payment =\'evenpays\' then 10000000 else cast(Min_Monthly_Payment as int) end)  = 10000000 then \'evenpays\' \n' +
    '\t\t\t\t\t\telse cast( min (case when Min_Monthly_Payment =\'evenpays\' then 10000000 else cast(Min_Monthly_Payment as int) end) as varchar) \n' +
    '\t\t\t\t\tend Min_Monthly_Pay, count(1) Total_Number_Settlements_pre_charge\n' +
    '\t\t\tfrom Creditor_var_Calc cv\n' +
    '\t\t\tjoin Creditor_limit_Calc_below_180 cl on cl.Name = cv.Creditor\n' +
    '\t\t\twhere NegotiationDate > Date_Limit\n' +
    '\t\t\t\t\tand DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) < 180\n' +
    '\t\t\tgroup by Creditor) cr3 on cr3.Creditor = COALESCE(cr1.Creditor,cr2.Creditor)\n' +
    '\n' +
    'full join Accepted_ratio_post_Charge cr4 on cr4.Creditor = COALESCE(cr1.Creditor,cr2.Creditor,cr3.Creditor)\n' +
    '\n' +
    'full join (Select * from (Select creditor,Number_of_Terms as Most_Accepted_Terms_post_Charge, Mode, \n' +
    '\t\t\t\t\t\t\t\tRow_NUmber() over (partition by creditor order by Mode desc,Number_Of_Terms desc) as Is_Max_Mode \n' +
    '\t\t\t\t\t\t from (Select cv.Creditor,Number_of_terms,count(1) as Mode\n' +
    '\t\t\t\t\t\t\t\t\tfrom Creditor_var_Calc cv\n' +
    '\t\t\t\t\t\t\t\t\tjoin Creditor_limit_Calc_above_180 cl on cl.Name = cv.Creditor\n' +
    '\t\t\t\t\t\t\t\t\tjoin Accepted_ratio_post_Charge ar on ar.Accepted_ratio = cv.Accepted_ratio and ar.Creditor = cv.Creditor\n' +
    '\t\t\t\t\t\t\t\t\twhere NegotiationDate > Date_Limit\n' +
    '\t\t\t\t\t\t\t\t\t\tand DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) >= 180\n' +
    '\t\t\t\t\t\t\t\t\tgroup by cv.Creditor,Number_of_terms) a \n' +
    '\t\t\t\t\t\t ) b where b.Is_Max_Mode = 1 ) cr5 on cr5.Creditor =  COALESCE(cr1.Creditor,cr2.Creditor,cr3.Creditor,cr4.Creditor)\n' +
    '\n' +
    'full join (Select Creditor,case when min (case when Min_Monthly_Payment =\'evenpays\' then 10000000 else cast(Min_Monthly_Payment as int) end)  = 10000000 then \'evenpays\' \n' +
    '\t\t\t\t\t\telse cast( min (case when Min_Monthly_Payment =\'evenpays\' then 10000000 else cast(Min_Monthly_Payment as int) end) as varchar) \n' +
    '\t\t\t\t\tend Min_Monthly_Pay , count(1) Total_Number_Settlements_post_charge\n' +
    '\t\t\tfrom Creditor_var_Calc cv\n' +
    '\t\t\tjoin Creditor_limit_Calc_above_180 cl on cl.Name = cv.Creditor\n' +
    '\t\t\twhere NegotiationDate > Date_Limit\n' +
    '\t\t\t\t\tand DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) >= 180\n' +
    '\t\t\tgroup by Creditor) cr6 on cr6.Creditor = COALESCE(cr1.Creditor,cr2.Creditor,cr3.Creditor,cr4.Creditor,cr5.Creditor)\n' +
    '\n' +
    'full join Creditor_limit_Calc_above_180 cra on cra.Name = COALESCE(cr1.Creditor,cr2.Creditor,cr3.Creditor,cr4.Creditor,cr5.Creditor, cr6.Creditor)\n' +
    'full join Creditor_limit_Calc_below_180 crb on crb.Name = Coalesce(cr1.Creditor,cr2.Creditor,cr3.Creditor,cr4.Creditor,cr5.Creditor, cr6.Creditor)\n';

    redshift.query(sql, { raw: true })
      .then((data) => {
        res.status(200).json('Table \"##temp_Creditor_Variables\" created successfully!');
      }, (err) => {
        res.status(500).json(err);
        throw err;
      });
});

router.get('/select_active_accounts', (req, res) => {
  const sql = '\n' +
    'with tradeline_calculated as\n' +
    '(Select stl.*, sac.accountname as Creditor, spg.enrolledState,spg.TotalDebtIncluded,spg.programname,\n' +
    '        spg.deleted as program_deleted  --spg.closedate\n' +
    ' from edw.dimtradeline_sf stl\n' +
    ' join (Select * from edw.dimprogram_SF spg  \n' +
    '       where spg.IsActive = 1 and\n' +
    '                       cast(spg.CreatedDate as date) >  \'2017-06-13\' and \n' +
    '                       (UPPER(spg.ProgramName) not like \'%TEST%\' or spg.ProgramName is null) and \n' +
    '                       (UPPER(spg.clientFirstName) not like \'%TEST%\' or spg.clientFirstName is null) and\n' +
    '                       (UPPER(spg.EmailAddress) not like \'%TEST%\' or spg.EmailAddress is null) and\n' +
    '                       spg.AccountId not in (\'0014600000jaugGAAQ\') and\n' +
    '                       UPPER(spg.ProgramStatus) not in (\'TERMINATION PENDING\',\'GRADUATION PENDING\',\'TERMINATED\',\'CLOSED\')) spg on UPPER(spg.programid) = UPPER(stl.programid)            \n' +
    ' left join (Select * from edw.dimaccount_Sf where isactive = 1) sac on UPPER(sac.accountid) = UPPER(case when stl.newcreditor is null or stl.newcreditor =\'\' then stl.originalcreditor else stl.newcreditor end)\n' +
    ' left join (Select * from edw.dimrecordtype_sf where isactive = 1) src on UPPER(src.id) = UPPER(sac.recordtypeid)\n' +
    ' where stl.isactive=1 and src.name = \'Creditor\' and stl.CurrentStage <> \'Removed\')\n' +
    '\n' +
    'Select stl.programname ,\n' +
    '       stl.tradelinename,\n' +
    '       stl.Creditor,\n' +
    '       stl.enrolledState,\n' +
    '       isnull(avg_monthly_pay,0) as Avg_monthly_payment,\n' +
    '       DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) as Account_Deliquency,\n' +
    '       isnull(fa.fund_in_CFT,0) as fund_in_CFT,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m0_bal,0)) m0_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m1_bal,0)) m1_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m2_bal,0)) m2_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m3_bal,0)) m3_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m4_bal,0)) m4_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m5_bal,0)) m5_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m6_bal,0)) m6_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m7_bal,0)) m7_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m8_bal,0)) m8_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m9_bal,0)) m9_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m10_bal,0)) m10_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m11_bal,0)) m11_bal,\n' +
    '       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m12_bal,0)) m12_bal,\n' +
    '       CASE when DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) < 180 \n' +
    '\t\t\t\t        then (coalesce(cv.Most_accepted_terms_pre_charge,cv.Most_accepted_terms_post_charge,6)-1)\n' +
    '\t\t\t\t    else (coalesce(cv.Most_accepted_terms_post_charge,cv.Most_accepted_terms_pre_charge,6)-1)\n' +
    '\t\t\t\t    end Max_Term,\n' +
    '       CASE WHEN DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) < 180 \n' +
    '\t\t\t\t        then ISNULL(fa.fund_in_CFT,0)+ ISNULL(te.term_End_acc_bal_pre_charge,0)\n' +
    '\t\t\t\t    else ISNULL(fa.fund_in_CFT,0)+ ISNULL(te.term_End_acc_bal_post_charge,0)\n' +
    '\t\t\t\t    end Max_Term_Fund_Accumulation,\n' +
    '\t\t\t stl.TotalDebtIncluded as Enrolled_Debt,\n' +
    '\t\t\t stl.VerifiedBalance, --Verified Debt\n' +
    '\t\t\t stl.OriginalBalance, --Enrolment balance(Acc level)\n' +
    '\t\t\t stl.CurrentBalance, --Balance to cc\n' +
    '\t\t\t stl.CurrentStage,\n' +
    '\t\t\t tln.createdDate as Tradeline_Last_Negotiated,\n' +
    '\t\t\t isnull(stl.originalaccountnumber,stl.newaccountnumber) as Account_Number\n' +
    '\n' +
    'from tradeline_calculated stl\n' +
    '\n' +
    '\n' +
    '-- calculating avg monthly payment by program            \n' +
    'left join (Select programid ,sum(amount)/ count(distinct last_day(scheduledate)) as avg_monthly_pay\n' +
    '           from edw.dimPayment_SF sp\n' +
    '           where sp.isactive = 1\n' +
    '                  and sp.paymenttype = \'Deposit\' \n' +
    '                  and TransactionStatus in (\'Completed\',\'Cleared\')\n' +
    '           group by programid) amp on stl.programid = amp.programid\n' +
    '           \n' +
    '-- Fund accumulated in CFT account\n' +
    'left join (Select programid ,sum(case when sp.paymenttype = \'Deposit\' then sp.amount else -sp.amount end ) as fund_in_CFT\n' +
    '           from edw.dimPayment_SF sp\n' +
    '           where sp.isactive = 1\n' +
    '                  and TransactionStatus in (\'Completed\',\'Cleared\')\n' +
    '           group by programid) fa on fa.programid = stl.programid\n' +
    '           \n' +
    'left join  ##temp_Creditor_Variables cv on cv.Creditor = UPPER(LTRIM(RTRIM(stl.Creditor)))\n' +
    '\n' +
    '\n' +
    '--Estimated term end fund accumulation\n' +
    'left join (Select stl.tradelineid , \n' +
    '                  SUM(CASE WHEN DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) < 180 and \n' +
    '                                date(sp.scheduledate) between getdate() and last_day(DATEADD(month,(coalesce(cv.Most_accepted_terms_pre_charge,cv.Most_accepted_terms_post_charge,6)-1),GETDATE())) and\n' +
    '                                sp.paymenttype = \'Deposit\' \n' +
    '                           then sp.amount\n' +
    '                           WHEN DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) < 180 and \n' +
    '                                date(sp.scheduledate) between getdate() and last_day(DATEADD(month,(coalesce(cv.Most_accepted_terms_pre_charge,cv.Most_accepted_terms_post_charge,6)-1),GETDATE())) and\n' +
    '                                sp.paymenttype <> \'Deposit\' \n' +
    '                           then -sp.amount      \n' +
    '                      ELSE 0 END) as term_End_acc_bal_pre_charge ,\n' +
    '                  SUM(CASE WHEN DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) >= 180 and \n' +
    '                                date(sp.scheduledate) between getdate() and last_day(DATEADD(month,(coalesce(cv.Most_accepted_terms_post_charge,cv.Most_accepted_terms_pre_charge,6)-1),GETDATE())) and\n' +
    '                                sp.paymenttype = \'Deposit\' \n' +
    '                           then sp.amount\n' +
    '                           WHEN DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) >= 180 and \n' +
    '                                date(sp.scheduledate) between getdate() and last_day(DATEADD(month,(coalesce(cv.Most_accepted_terms_post_charge,cv.Most_accepted_terms_pre_charge,6)-1),GETDATE())) and\n' +
    '                                sp.paymenttype <> \'Deposit\' \n' +
    '                           then -sp.amount      \n' +
    '                      ELSE 0 END) as term_End_acc_bal_post_charge\n' +
    '            from tradeline_calculated stl\n' +
    '            join edw.dimPayment_sf sp on sp.programid = stl.programid\n' +
    '            left join ##temp_Creditor_Variables cv on cv.Creditor = UPPER(LTRIM(RTRIM(stl.Creditor)))\n' +
    '            where sp.isactive = 1\n' +
    '                  and sp.TransactionStatus = \'Pending\'\n' +
    '            group by stl.tradelineid) te on te.tradelineID = stl.tradelineid\n' +
    '                  \n' +
    '--Estimated Pending ins and outs till this,1,2,3,4,5,6---12 EOM\n' +
    'left join (Select programid , \n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(GETDATE()) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(GETDATE()) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m0_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,1,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,1,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m1_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,2,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,2,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m2_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,3,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,3,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m3_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,4,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,4,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m4_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,5,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,5,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m5_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,6,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,6,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m6_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,7,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,7,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m7_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,8,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,8,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m8_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,9,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,9,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m9_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,10,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,10,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m10_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,11,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,11,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m11_bal,\n' +
    '                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,12,GETDATE())) and sp.paymenttype = \'Deposit\' then sp.amount \n' +
    '                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,12,GETDATE())) and sp.paymenttype <> \'Deposit\' then -sp.amount \n' +
    '                      else 0 end ) as m12_bal\n' +
    '           from edw.dimPayment_SF sp\n' +
    '           where sp.isactive = 1\n' +
    '                 and TransactionStatus in (\'Pending\')\n' +
    '           group by programid) io on io.programid = stl.programid\n' +
    '           \n' +
    '--Tradeline last negotiated on(Not Processed)\n' +
    'left join (Select so.*,row_number() over (partition by so.tradeline order by so.createddate desc) is_last_negotiation \n' +
    '           from edw.dimOffer_SF so\n' +
    '           join tradeline_calculated stl on stl.tradelineid = so.tradeline\n' +
    '           where so.isactive=1) tln on tln.tradeline = stl.tradelineID and is_last_negotiation = 1\n' +
    '           \n' +
    'where stl.tradelineID not in (Select tradeline from edw.dimOffer_SF so where so.isactive=1 and status in (\'Accepted\', \'Send To Accounting\'))\n' +
    '      and stl.deleted = 0\n' +
    '      and stl.program_deleted = 0\n' +
    '      and UPPER(stl.currentstage) not in (\'REMOVED\')\n' +
    '      and stl.includeintheprogram = 1\n' +
    '      and stl.programid not in \n' +
    '              (Select programID from tradeline_calculated  \n' +
    '               where UPPER(currentstage) in (\'BANK LEVY\', \'GARNISHMENT\', \'JUDGMENT\',\'SUMMONS RECEIVED\')\n' +
    '               union all\n' +
    '               Select programid from edw.dimOffer_SF so where so.isactive=1 and status = \'Canceled\')';

    redshift.query(sql, { raw: true })
      .then((data) => {
        res.status(200).json(data);
      }, (err) => {
        res.status(500).json(err);
        throw err;
      });
});

router.get('/drop_temp_creditor_variables', (req, res) => {
  const sql = 'drop table if exists ##temp_Creditor_Variables';

  redshift.query(sql, { raw: true })
    .then((data) => {
      res.status(200).json('Table \"##temp_Creditor_Variables\" dropped successfully!');
    }, (err) => {
      res.status(500).json(err);
      throw err;
    });
});

router.get('/select_temp_creditor_variables', (req, res) => {
  // const sql = 'select top 2 ##temp_Creditor_Variables.* from ##temp_Creditor_Variables';
  const sql = 'select ##temp_Creditor_Variables.* from ##temp_Creditor_Variables';

  redshift.query(sql, { raw: true })
    .then((data) => {
      res.status(200).json(data);
    }, (err) => {
      res.status(500).json(err);
      throw err;
    });
});

router.get('/select_sessions', (req, res) => {
  const redshift = new Redshift(clientConfiguration);
  const sql = 'select * from stv_sessions';

  redshift.query(sql, { raw: true })
    .then((data) => {
      res.status(200).json(data);
      // if you want to close client pool, uncomment redshift.close() line
      // but you won't be able to make subsequent calls because connection is terminated
      redshift.close();
    }, (err) => {
      res.status(500).json(err);
      throw err;
    });
});

router.get('/get_all_tables', (req, res) => {
  const redshift = new Redshift(clientConfiguration);
  const sql = 'select * from stv_tbl_perm';

  redshift.query(sql, { raw: true })
    .then((data) => {
      res.status(200).json(data);
      // if you want to close client pool, uncomment redshift.close() line
      // but you won't be able to make subsequent calls because connection is terminated
      redshift.close();
    }, (err) => {
      res.status(500).json(err);
      throw err;
    });
});

router.get('/test_request', (req, res) => {
  res.json([1,2,3]);
});


module.exports = router;

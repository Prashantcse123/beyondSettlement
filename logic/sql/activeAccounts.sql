with tradeline_calculated as
(Select stl.*, sac.accountname as Creditor, spg.enrolledState,spg.TotalDebtIncluded,spg.programname,
        spg.deleted as program_deleted  --spg.closedate
 from edw.dimtradeline_sf stl
 join (Select * from edw.dimprogram_SF spg
       where spg.IsActive = 1 and
                       cast(spg.CreatedDate as date) >  '2017-06-13' and
                       (UPPER(spg.ProgramName) not like '%TEST%' or spg.ProgramName is null) and
                       (UPPER(spg.clientFirstName) not like '%TEST%' or spg.clientFirstName is null) and
                       (UPPER(spg.EmailAddress) not like '%TEST%' or spg.EmailAddress is null) and
                       spg.AccountId not in ('0014600000jaugGAAQ') and
                       UPPER(spg.ProgramStatus) not in ('TERMINATION PENDING','GRADUATION PENDING','TERMINATED','CLOSED')) spg on UPPER(spg.programid) = UPPER(stl.programid)
 left join (Select * from edw.dimaccount_Sf where isactive = 1) sac on UPPER(sac.accountid) = UPPER(case when stl.newcreditor is null or stl.newcreditor ='' then stl.originalcreditor else stl.newcreditor end)
 left join (Select * from edw.dimrecordtype_sf where isactive = 1) src on UPPER(src.id) = UPPER(sac.recordtypeid)
 where stl.isactive=1 and src.name = 'Creditor' and stl.CurrentStage <> 'Removed')

Select stl.programname ,
       stl.tradelinename,
       stl.Creditor,
       stl.enrolledState,
       isnull(avg_monthly_pay,0) as Avg_monthly_payment,
       DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) as Account_Deliquency,
       isnull(fa.fund_in_CFT,0) as fund_in_CFT,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m0_bal,0)) m0_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m1_bal,0)) m1_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m2_bal,0)) m2_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m3_bal,0)) m3_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m4_bal,0)) m4_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m5_bal,0)) m5_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m6_bal,0)) m6_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m7_bal,0)) m7_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m8_bal,0)) m8_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m9_bal,0)) m9_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m10_bal,0)) m10_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m11_bal,0)) m11_bal,
       (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m12_bal,0)) m12_bal,
       CASE when DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) < 180
				        then (coalesce(cv.Most_accepted_terms_pre_charge,cv.Most_accepted_terms_post_charge,6)-1)
				    else (coalesce(cv.Most_accepted_terms_post_charge,cv.Most_accepted_terms_pre_charge,6)-1)
				    end Max_Term,
       CASE WHEN DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) < 180
				        then ISNULL(fa.fund_in_CFT,0)+ ISNULL(te.term_End_acc_bal_pre_charge,0)
				    else ISNULL(fa.fund_in_CFT,0)+ ISNULL(te.term_End_acc_bal_post_charge,0)
				    end Max_Term_Fund_Accumulation,
			 stl.TotalDebtIncluded as Enrolled_Debt,
			 stl.VerifiedBalance, --Verified Debt
			 stl.OriginalBalance, --Enrolment balance(Acc level)
			 stl.CurrentBalance, --Balance to cc
			 stl.CurrentStage,
			 tln.createdDate as Tradeline_Last_Negotiated,
			 isnull(stl.originalaccountnumber,stl.newaccountnumber) as Account_Number

from tradeline_calculated stl


-- calculating avg monthly payment by program
left join (Select programid ,sum(amount)/ count(distinct last_day(scheduledate)) as avg_monthly_pay
           from edw.dimPayment_SF sp
           where sp.isactive = 1
                  and sp.paymenttype = 'Deposit'
                  and TransactionStatus in ('Completed','Cleared')
           group by programid) amp on stl.programid = amp.programid

-- Fund accumulated in CFT account
left join (Select programid ,sum(case when sp.paymenttype = 'Deposit' then sp.amount else -sp.amount end ) as fund_in_CFT
           from edw.dimPayment_SF sp
           where sp.isactive = 1
                  and TransactionStatus in ('Completed','Cleared')
           group by programid) fa on fa.programid = stl.programid

left join  ##temp_Creditor_Variables cv on cv.Creditor = UPPER(LTRIM(RTRIM(stl.Creditor)))


--Estimated term end fund accumulation
left join (Select stl.tradelineid ,
                  SUM(CASE WHEN DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) < 180 and
                                date(sp.scheduledate) between getdate() and last_day(DATEADD(month,(coalesce(cv.Most_accepted_terms_pre_charge,cv.Most_accepted_terms_post_charge,6)-1),GETDATE())) and
                                sp.paymenttype = 'Deposit'
                           then sp.amount
                           WHEN DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) < 180 and
                                date(sp.scheduledate) between getdate() and last_day(DATEADD(month,(coalesce(cv.Most_accepted_terms_pre_charge,cv.Most_accepted_terms_post_charge,6)-1),GETDATE())) and
                                sp.paymenttype <> 'Deposit'
                           then -sp.amount
                      ELSE 0 END) as term_End_acc_bal_pre_charge ,
                  SUM(CASE WHEN DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) >= 180 and
                                date(sp.scheduledate) between getdate() and last_day(DATEADD(month,(coalesce(cv.Most_accepted_terms_post_charge,cv.Most_accepted_terms_pre_charge,6)-1),GETDATE())) and
                                sp.paymenttype = 'Deposit'
                           then sp.amount
                           WHEN DATEDIFF(day, ISNULL(stl.LastPaymentDate, stl.CreatedDate),GETDATE()) >= 180 and
                                date(sp.scheduledate) between getdate() and last_day(DATEADD(month,(coalesce(cv.Most_accepted_terms_post_charge,cv.Most_accepted_terms_pre_charge,6)-1),GETDATE())) and
                                sp.paymenttype <> 'Deposit'
                           then -sp.amount
                      ELSE 0 END) as term_End_acc_bal_post_charge
            from tradeline_calculated stl
            join edw.dimPayment_sf sp on sp.programid = stl.programid
            left join ##temp_Creditor_Variables cv on cv.Creditor = UPPER(LTRIM(RTRIM(stl.Creditor)))
            where sp.isactive = 1
                  and sp.TransactionStatus = 'Pending'
            group by stl.tradelineid) te on te.tradelineID = stl.tradelineid

--Estimated Pending ins and outs till this,1,2,3,4,5,6---12 EOM
left join (Select programid ,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(GETDATE()) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(GETDATE()) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m0_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,1,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,1,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m1_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,2,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,2,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m2_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,3,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,3,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m3_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,4,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,4,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m4_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,5,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,5,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m5_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,6,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,6,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m6_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,7,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,7,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m7_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,8,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,8,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m8_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,9,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,9,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m9_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,10,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,10,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m10_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,11,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,11,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m11_bal,
                  sum(case when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,12,GETDATE())) and sp.paymenttype = 'Deposit' then sp.amount
                           when date(sp.scheduledate) between GETDATE() and last_day(DATEADD(MONTH,12,GETDATE())) and sp.paymenttype <> 'Deposit' then -sp.amount
                      else 0 end ) as m12_bal
           from edw.dimPayment_SF sp
           where sp.isactive = 1
                 and TransactionStatus in ('Pending')
           group by programid) io on io.programid = stl.programid

--Tradeline last negotiated on(Not Processed)
left join (Select so.*,row_number() over (partition by so.tradeline order by so.createddate desc) is_last_negotiation
           from edw.dimOffer_SF so
           join tradeline_calculated stl on stl.tradelineid = so.tradeline
           where so.isactive=1) tln on tln.tradeline = stl.tradelineID and is_last_negotiation = 1

where stl.tradelineID not in (Select tradeline from edw.dimOffer_SF so where so.isactive=1 and status in ('Accepted', 'Send To Accounting'))
      and stl.deleted = 0
      and stl.program_deleted = 0
      and UPPER(stl.currentstage) not in ('REMOVED')
      and stl.includeintheprogram = 1
      and stl.programid not in
              (Select programID from tradeline_calculated
               where UPPER(currentstage) in ('BANK LEVY', 'GARNISHMENT', 'JUDGMENT','SUMMONS RECEIVED')
               union all
               Select programid from edw.dimOffer_SF so where so.isactive=1 and status = 'Canceled')

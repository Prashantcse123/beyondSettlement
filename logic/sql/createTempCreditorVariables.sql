With Creditor_var_Calc as
(Select ccn.ClientCredID,ccn.ClientCredNegotiationID,UPPER(LTRIM(RTRIM(cr.name))) Creditor,
			ROUND(ccn.Accepted_ratio, 2) Accepted_ratio,
			ss.Number_of_terms,
			ccn.OfferAmount, Total_Offer_Schedule_Amt,
			min_amount,
			cast(round((ccn.OfferAmount/Number_of_terms)*0.95,0) as int) Monthly_payment_Calc,
			case when min_amount <= cast(round((ccn.OfferAmount/Number_of_terms)*0.95,0) as int) then cast(min_amount as varchar)
					else 'evenpays'
					end Min_Monthly_Payment,
			cc.OriginalDueDate, cc.DateEntered, ccn.NegotiationDate
	from

	--To get last negotiation before first processed date
	(Select clientCredNegotiationID,ccn.ClientCredID,ccn.Processed, ccn.NegotiationDate , round(ccn.OfferAmount,0) OfferAmount,
					ccn.OfferAmount/(case when ccn.BalanceAtTimeOfNegotiation=0 then 1 else ccn.BalanceAtTimeOfNegotiation end)   Accepted_ratio,
					ROW_NUMBER() over (Partition by ccn.ClientCredID order by NegotiationDate desc) is_latest
			from  cs.clientCredNegotiation ccn
			join (select min(changedate) as firstprocessdate, clientcredid, clientid
							from cs.accountstatushistory (nolock)
     						where newstatus in ('TERM SIF')
      						group by clientcredid, clientid) cc on ccn.ClientCredID = cc.ClientCredID and ccn.NegotiationDate <= firstprocessdate) ccn


	--To get total # terms (payment terms) [CreditorPaymentNumber is <> 0 for creditor pays]
	join (Select ss.ClientCredNegotiationID,max(ss.CreditorPaymentNumber) Number_of_terms , round(sum(ss.amount),0) Total_Offer_Schedule_Amt
				from cs.SettlementSchedule ss
				join cs.ProgramScheduleDebtor psd on psd.SettlementScheduleID = ss.SettlementScheduleID	--413618
				where CreditorPaymentNumber <> 0
				group by ss.ClientCredNegotiationID) ss on ss.ClientCredNegotiationID = ccn.ClientCredNegotiationID


	--To get min of all scheduled creditor pays (excluding last scheuled pay)
	left join (Select ClientCredNegotiationID, cast(round(min(amount),0) as int) min_amount
				from (Select ROW_NUMBER() over (partition by ss.ClientCredNegotiationID order by psd.DueDate desc ) is_last_pay ,ss.*
						from cs.SettlementSchedule ss
						join cs.ProgramScheduleDebtor psd on psd.SettlementScheduleID = ss.SettlementScheduleID
						where CreditorPaymentNumber <> 0 ) SS
			where is_last_pay <> 1 and ss.amount > 9.5
			group by ClientCredNegotiationID) mp on mp.ClientCredNegotiationID = ccn.ClientCredNegotiationID

	left join cs.ClientCred cc on cc.ClientCredID = ccn.ClientCredID
	left Join cs.Creditors cr on cr.creditorID = cc.CreditorID

	where ccn.is_latest=1
			and Number_of_terms is not null
			and ccn.OfferAmount = Total_Offer_Schedule_Amt
) ,
Creditor_limit_Calc_below_180 as
(Select name,
		case when one_twenty >=5 then DATEADD(day,-120,getdate())
			 when two_fourty >=5 then DATEADD(day,-240,getdate())
			 else '1/1/2000' end Date_Limit
from (Select name,SUM(CASE when NegotiationDate > DATEADD(day,-120,getdate())	THEN 1 else 0 end) as one_twenty,
			 SUM(CASE when NegotiationDate > DATEADD(day,-240,getdate())	THEN 1 else 0 end) as two_fourty,
					 count(ccn.ClientCredNegotiationID) total
		from (Select clientCredNegotiationID,ccn.ClientCredID,ccn.Processed, ccn.NegotiationDate , round(ccn.OfferAmount,0) OfferAmount,UPPER(LTRIM(RTRIM(cr.name))) as name,
							ccn.OfferAmount/(case when ccn.BalanceAtTimeOfNegotiation=0 then 1 else ccn.BalanceAtTimeOfNegotiation end)  Accepted_ratio,
							ROW_NUMBER() over (Partition by ccn.ClientCredID order by NegotiationDate desc) is_latest
					from  cs.clientCredNegotiation ccn
					join cs.ClientCred cc on cc.ClientCredID = ccn.ClientCredID
					join cs.Creditors cr on cr.CreditorID = cc.CreditorID
					join (select min(changedate) as firstprocessdate, clientcredid, clientid
									from cs.accountstatushistory (nolock)
									where newstatus in ('TERM SIF')
									group by clientcredid, clientid) ash on ccn.ClientCredID = ash.ClientCredID and ccn.NegotiationDate <= firstprocessdate
					where DATEDIFF(day, ISNULL(OriginalDueDate, cc.DateEntered),NegotiationDate) < 180) ccn

		join (Select ss.ClientCredNegotiationID, round(sum(ss.amount),0) Total_Offer_Schedule_Amt
						from cs.SettlementSchedule ss
						join cs.ProgramScheduleDebtor psd on psd.SettlementScheduleID = ss.SettlementScheduleID	--413618
						where CreditorPaymentNumber <> 0
						group by ss.ClientCredNegotiationID) ss on ss.ClientCredNegotiationID = ccn.ClientCredNegotiationID
		where is_latest = 1
			 and OfferAmount = Total_Offer_Schedule_Amt
		group by name) cr1
),
Creditor_limit_Calc_above_180 as
(Select name,
		case when one_twenty >=5 then DATEADD(day,-120,getdate())
			 when two_fourty >=5 then DATEADD(day,-240,getdate())
			 else '1/1/2000' end Date_Limit
from (Select name,SUM(CASE when NegotiationDate > DATEADD(day,-120,getdate())	THEN 1 else 0 end) as one_twenty,
			 SUM(CASE when NegotiationDate > DATEADD(day,-240,getdate())	THEN 1 else 0 end) as two_fourty,
					 count(ccn.ClientCredNegotiationID) total
		from (Select clientCredNegotiationID,ccn.ClientCredID,ccn.Processed, ccn.NegotiationDate , round(ccn.OfferAmount,0) OfferAmount,UPPER(LTRIM(RTRIM(cr.name))) as name,
							ccn.OfferAmount/(case when ccn.BalanceAtTimeOfNegotiation=0 then 1 else ccn.BalanceAtTimeOfNegotiation end)  Accepted_ratio,
							ROW_NUMBER() over (Partition by ccn.ClientCredID order by NegotiationDate desc) is_latest
					from  cs.clientCredNegotiation ccn
					join cs.ClientCred cc on cc.ClientCredID = ccn.ClientCredID
					join cs.Creditors cr on cr.CreditorID = cc.CreditorID
					join (select min(changedate) as firstprocessdate, clientcredid, clientid
									from cs.accountstatushistory (nolock)
									where newstatus in ('TERM SIF')
									group by clientcredid, clientid) ash on ccn.ClientCredID = ash.ClientCredID and ccn.NegotiationDate <= firstprocessdate
					where DATEDIFF(day, ISNULL(OriginalDueDate, cc.DateEntered),NegotiationDate) >= 180) ccn

		join (Select ss.ClientCredNegotiationID, round(sum(ss.amount),0) Total_Offer_Schedule_Amt
						from cs.SettlementSchedule ss
						join cs.ProgramScheduleDebtor psd on psd.SettlementScheduleID = ss.SettlementScheduleID	--413618
						where CreditorPaymentNumber <> 0
						group by ss.ClientCredNegotiationID) ss on ss.ClientCredNegotiationID = ccn.ClientCredNegotiationID
		where is_latest = 1
			 and OfferAmount = Total_Offer_Schedule_Amt
		group by name) cr1 ),
Accepted_ratio_pre_Charge as
(Select b.* from (Select *, ROW_NUMBER() OVER (Partition by  Creditor order by Number_Settlements desc, Accepted_Ratio desc) Is_Most_Acc_Ratio
		from	(Select cv.Creditor, cv.Accepted_Ratio, count(1) Number_Settlements
					from Creditor_var_Calc cv
					join Creditor_limit_Calc_below_180 cl on cl.Name = cv.Creditor
					where NegotiationDate > Date_Limit
						 and DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) < 180
					group by Creditor,Accepted_Ratio) a ) b where Is_Most_Acc_Ratio = 1),
Accepted_ratio_post_Charge as
( Select b.* from (Select *, ROW_NUMBER() OVER (Partition by  Creditor order by Number_Settlements desc, Accepted_Ratio desc) Is_Most_Acc_Ratio
			from (Select cv.Creditor, cv.Accepted_Ratio, count(1) Number_Settlements
					from Creditor_var_Calc cv
					join Creditor_limit_Calc_above_180 cl on cl.Name = cv.Creditor
					where NegotiationDate > Date_Limit
						and DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) >= 180
					group by Creditor,Accepted_Ratio) a ) b where Is_Most_Acc_Ratio = 1)


Select	COALESCE(cr1.Creditor,cr2.Creditor,cr3.Creditor,cr4.Creditor,cr5.Creditor,cr6.Creditor) Creditor,
		cr1.Accepted_Ratio as Most_Accepted_Ratio_pre_charge ,
		cr2.Most_Accepted_Terms_pre_Charge,
		cr3.Min_Monthly_Pay as Min_Monthly_Pay_pre_charge,
		cr3.Total_Number_Settlements_pre_charge,
		(Case when crb.Date_Limit='2000-01-01 00:00:00.000' then'All history'
		    when datediff(day,crb.Date_Limit,getdate())=120 then 'Last 120 days'
			when datediff(day,crb.Date_Limit,getdate())=240 then 'Last 240 days' end) DL_Pre,
		cr4.Accepted_Ratio as Most_Accepted_Ratio_post_charge ,
		cr5.Most_Accepted_Terms_post_Charge,
		cr6.Min_Monthly_Pay as Min_Monthly_Pay_post_charge,
		cr6.Total_Number_Settlements_post_charge,
		(Case when cra.Date_Limit='2000-01-01 00:00:00.000' then'All history'
		    when datediff(day,cra.Date_Limit,getdate())=120 then 'Last 120 days'
			when datediff(day,cra.Date_Limit,getdate())=240 then 'Last 240 days' end) DL_post
		--(isnull(cr2.Total_Number_Settlements,0) + 	isnull(cr5.Total_Number_Settlements,0)) as Number_Settlements

--drop table ##temp_Creditor_Variables
into ##temp_Creditor_Variables

from Accepted_ratio_pre_Charge cr1

full join (Select * from (Select creditor,Number_of_Terms as Most_Accepted_Terms_pre_Charge, Mode,
								Row_NUmber() over (partition by creditor order by Mode desc,Number_Of_Terms desc) as Is_Max_Mode
						 from (Select cv.Creditor,Number_of_terms,count(1) as Mode
									from Creditor_var_Calc cv
									join Creditor_limit_Calc_below_180 cl on cl.Name = cv.Creditor
									join Accepted_ratio_pre_Charge ar on ar.creditor = cv.Creditor and ar.Accepted_ratio = cv.Accepted_ratio
									where NegotiationDate > Date_Limit
										and DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) < 180
									group by cv.Creditor,Number_of_terms) a
						 ) b where b.Is_Max_Mode = 1)cr2 on cr2.Creditor = cr1.Creditor

full join (Select Creditor,case when min (case when Min_Monthly_Payment ='evenpays' then 10000000 else cast(Min_Monthly_Payment as int) end)  = 10000000 then 'evenpays'
						else cast( min (case when Min_Monthly_Payment ='evenpays' then 10000000 else cast(Min_Monthly_Payment as int) end) as varchar)
					end Min_Monthly_Pay, count(1) Total_Number_Settlements_pre_charge
			from Creditor_var_Calc cv
			join Creditor_limit_Calc_below_180 cl on cl.Name = cv.Creditor
			where NegotiationDate > Date_Limit
					and DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) < 180
			group by Creditor) cr3 on cr3.Creditor = COALESCE(cr1.Creditor,cr2.Creditor)

full join Accepted_ratio_post_Charge cr4 on cr4.Creditor = COALESCE(cr1.Creditor,cr2.Creditor,cr3.Creditor)

full join (Select * from (Select creditor,Number_of_Terms as Most_Accepted_Terms_post_Charge, Mode,
								Row_NUmber() over (partition by creditor order by Mode desc,Number_Of_Terms desc) as Is_Max_Mode
						 from (Select cv.Creditor,Number_of_terms,count(1) as Mode
									from Creditor_var_Calc cv
									join Creditor_limit_Calc_above_180 cl on cl.Name = cv.Creditor
									join Accepted_ratio_post_Charge ar on ar.Accepted_ratio = cv.Accepted_ratio and ar.Creditor = cv.Creditor
									where NegotiationDate > Date_Limit
										and DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) >= 180
									group by cv.Creditor,Number_of_terms) a
						 ) b where b.Is_Max_Mode = 1 ) cr5 on cr5.Creditor =  COALESCE(cr1.Creditor,cr2.Creditor,cr3.Creditor,cr4.Creditor)

full join (Select Creditor,case when min (case when Min_Monthly_Payment ='evenpays' then 10000000 else cast(Min_Monthly_Payment as int) end)  = 10000000 then 'evenpays'
						else cast( min (case when Min_Monthly_Payment ='evenpays' then 10000000 else cast(Min_Monthly_Payment as int) end) as varchar)
					end Min_Monthly_Pay , count(1) Total_Number_Settlements_post_charge
			from Creditor_var_Calc cv
			join Creditor_limit_Calc_above_180 cl on cl.Name = cv.Creditor
			where NegotiationDate > Date_Limit
					and DATEDIFF(day, ISNULL(OriginalDueDate, DateEntered),NegotiationDate) >= 180
			group by Creditor) cr6 on cr6.Creditor = COALESCE(cr1.Creditor,cr2.Creditor,cr3.Creditor,cr4.Creditor,cr5.Creditor)

full join Creditor_limit_Calc_above_180 cra on cra.Name = COALESCE(cr1.Creditor,cr2.Creditor,cr3.Creditor,cr4.Creditor,cr5.Creditor, cr6.Creditor)
full join Creditor_limit_Calc_below_180 crb on crb.Name = Coalesce(cr1.Creditor,cr2.Creditor,cr3.Creditor,cr4.Creditor,cr5.Creditor, cr6.Creditor)

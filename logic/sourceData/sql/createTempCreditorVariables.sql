-- Merge csct and bct_delinquency(Beyond creditor terms with delinquency overrides)
with
Creditor_var_Calc as (Select stl.ProgramName, stl.Name as TradelineName, stl.Id as TradelineId, so.OfferID, stl.Creditor,
                                  round(so.OfferAmount*1.00/COALESCE(NULL,stl.nu_dse__Current_Balance__c,stl.nu_dse__Original_Debt__c),2) as Accepted_Ratio,
                                  sp.Number_of_CreditorPays, mp.Minimum_Pay,
                                  so.OfferAmount, sp.Offer_Amount_Scheduled,
                                  cast(round((so.OfferAmount/ sp.Number_of_CreditorPays)*0.95,0) as int) Monthly_payment_Calc,
                          			  case when mp.Minimum_Pay <= cast(round((so.OfferAmount/ sp.Number_of_CreditorPays)*0.95,0) as int)
                          			             then cast( mp.Minimum_Pay as varchar)
                          					   else 'evenpays'
                          					   end Min_Monthly_Payment,
                                  stl.nu_dse__Last_Payment_Date__c as lastpaymentdate, stl.CreatedDate as Tradeline_EnrolledDate,
                                  stl.number_of_days_overdue__c as number_of_days_overdue, so.NegotiatedOn

                      from (Select stl.*, UPPER(sac.Name) as Creditor, spg.Name as ProgramName
                            from datalake_sf.sf_nu_dse_tradeline_c_src stl
                            join (Select spg.* from datalake_sf.sf_nu_dse_program_c_src spg
                                  where
                                        spg.CreatedDate > cast('2017-06-13' as date) and
                                        (UPPER(spg.Name) not like '%TEST%' or spg.Name is null) and
                                        (UPPER(spg.Client_First_Name__c) not like '%TEST%' or spg.Client_First_Name__c is null) and
                                        (UPPER(spg.Email_Address__c) not like '%TEST%' or spg.Email_Address__c is null) and
                                        spg.nu_dse__Account__c not in ('0014600000jaugGAAQ') and
                                        UPPER(spg.nu_dse__Program_Status__c) not in ('CLOSED')) spg on UPPER(spg.Id) = UPPER(stl.nu_dse__Program__c)
                            left join (Select * from datalake_sf.sf_account_src
                                       ) sac on UPPER(sac.Id) = UPPER(case when stl.nu_dse__New_Creditor__c is null or stl.nu_dse__New_Creditor__c =''
                                                                                    then stl.nu_dse__Original_Creditor__c
                                                                                 else stl.nu_dse__New_Creditor__c end)
                            left join (Select * from datalake_sf.sf_recordtype_src) src on UPPER(src.id) = UPPER(sac.RecordTypeId)
                            where src.name = 'Creditor' and stl.nu_dse__Current_Stage__c <> 'Removed' and  stl.nu_dse__Include_In_The_Program__c = 1 ) stl

                      -- First Accepted Offer for a tradeline
                      join (  Select soh.parentID as OfferID, soh.CreatedDate as First_Processed_On, so.tradeline,
                                      so.OfferAmount, so.NegotiatedOn,
                                      row_number() over (partition by so.tradeline order by soh.CreatedDate asc, id asc) as is_first_processed
                              from datalake_sf.sf_nu_dse_offer_history_src soh
                              join (  Select Id as OID, nu_dse__TradeLine__c as tradeline, nu_dse__Offer_Amount__c as OfferAmount, CreatedDate as NegotiatedOn
                                      from datalake_sf.sf_nu_dse_offer_c_src
                                    ) so on so.OID = soh.parentID
                              --where soh.Field = 'Status'
                                    --and soh.newvalue = 'Accepted'
                             ) so on so.tradeline = stl.Id
                                      and is_first_processed = 1

                      --To get total # terms (payment terms)
                      join (Select sp.nu_dse__Offer__c as Offer, sum(sp.nu_dse__Amount__c) as Offer_Amount_Scheduled, count(sp.Id) as Number_of_CreditorPays
                                  from datalake_sf.sf_nu_dse_payment_c_src sp
                                  where sp.nu_dse__Payment_Type__c = 'Withdrawal'
                                        and sp.nu_dse__Transaction_Status__c in ('Completed','Cleared','Pending','Scheduled','In Progress')
                                  group by sp.nu_dse__Offer__c) sp on sp.Offer = so.OfferID

                      --To get min of all scheduled creditor pays (excluding last scheuled pay)
                      left join (Select sp.Offer, cast(min (sp.amount) as int) as Minimum_Pay
                                  from (Select sp.nu_dse__Offer__c as Offer, sp.nu_dse__Amount__c as amount,
                                               row_number() over (partition by sp.nu_dse__Offer__c order by sp.nu_dse__Schedule_Date__c desc) as is_last_pay
                                        from datalake_sf.sf_nu_dse_payment_c_src sp
                                        where sp.nu_dse__Payment_Type__c = 'Withdrawal'
                                              and sp.nu_dse__Transaction_Status__c in ('Completed','Cleared','Pending','Scheduled','In Progress')
                                        ) sp
                                  where is_last_pay <> 1
                                  group by sp.Offer
                                 ) mp on mp.Offer = so.OfferID

                      where cast(so.OfferAmount as int) = cast(sp.Offer_Amount_Scheduled as int)
                      ) -- Creditor_var_Calc ends here

-- Calculated date limit( Till where # settlements are more than 5) for pre charged settlements
,Creditor_limit_Calc_below_180 as (Select cr.Creditor,
                                          case when cr.one_twenty >=5 then DATEADD(day,-120,getdate())
                                               when cr.two_fourty >=5 then DATEADD(day,-240,getdate())
                                               else '2017-06-13' end Date_Limit
                                  from (Select  cvc.Creditor,
                                                  SUM(CASE when cvc.NegotiatedOn > DATEADD(day,-120,getdate())	THEN 1 else 0 end) as one_twenty,
                                          			  SUM(CASE when cvc.NegotiatedOn > DATEADD(day,-240,getdate())	THEN 1 else 0 end) as two_fourty,
                                          				count(cvc.OfferID) total
                                           from Creditor_var_Calc cvc
                                           left join asb.creditor_delinquency d on upper(d.creditor)=upper(cvc.creditor)
                                           where DATEDIFF(day, ISNULL(cvc.lastpaymentdate, cvc.Tradeline_EnrolledDate),cvc.NegotiatedOn) < isnull(d.delinquency,180)
                                           group by cvc.Creditor
                                        ) cr
                                    ) -- Creditor_limit_Calc_below_180 ends here

-- Calculated date limit( Till where # settlements are more than 5) for post charged settlements
,Creditor_limit_Calc_above_180 as (Select  cr.Creditor,
                                          case when cr.one_twenty >=5 then DATEADD(day,-120,getdate())
                                               when cr.two_fourty >=5 then DATEADD(day,-240,getdate())
                                               else '2017-06-13' end Date_Limit
                                  from (Select  cvc.Creditor,
                                                  SUM(CASE when cvc.NegotiatedOn > DATEADD(day,-120,getdate())	THEN 1 else 0 end) as one_twenty,
                                          			  SUM(CASE when cvc.NegotiatedOn > DATEADD(day,-240,getdate())	THEN 1 else 0 end) as two_fourty,
                                          				count(cvc.OfferID) total
                                          from Creditor_var_Calc cvc
                                           left join asb.creditor_delinquency d on upper(d.creditor)=upper(cvc.creditor)
                                           where DATEDIFF(day, ISNULL(cvc.lastpaymentdate, cvc.Tradeline_EnrolledDate),cvc.NegotiatedOn) >= isnull(d.delinquency,180)
                                           group by cvc.Creditor
                                        ) cr
                                    ) -- Creditor_limit_Calc_above_180 ends here

--Calculate pre charged settlements till date limit
,Settlements_pre_charge as (Select cv.*
                              from Creditor_var_Calc cv
                              join Creditor_limit_Calc_below_180 cl on cl.Creditor = cv.Creditor
                              left join asb.creditor_delinquency d on upper(d.creditor)=upper(cv.creditor)
                              where DATEDIFF(day, ISNULL(cv.lastpaymentdate, cv.Tradeline_EnrolledDate),cv.NegotiatedOn) < isnull(d.delinquency,180)
                                    and cl.Date_Limit < cv.NegotiatedOn
                            )    -- Settlements_pre_charge end here

--Calculate post charged settlements till date limit
,Settlements_post_charge as (Select cv.*
                              from Creditor_var_Calc cv
                              join Creditor_limit_Calc_above_180 cl on cl.Creditor = cv.Creditor
                              left join asb.creditor_delinquency d on upper(d.creditor)=upper(cv.creditor)
                              where DATEDIFF(day, ISNULL(cv.lastpaymentdate, cv.Tradeline_EnrolledDate),cv.NegotiatedOn) >= isnull(d.delinquency,180)
                                    and cl.Date_Limit < cv.NegotiatedOn
                            )    -- Settlements_post_charge end here


Select  COALESCE(t_pr.Creditor, t_po.Creditor) as Creditor,
        -- Pre Charge terms
        t_pr.Most_Accepted_Ratio as Most_Accepted_Ratio_pre_charge,
        t_pr.Most_Accepted_Pays as Most_Accepted_Terms_pre_Charge,
        s_pr.Min_Monthly_Pay as Min_Monthly_Pay_pre_charge,
        s_pr.Total_Settlements as Total_Number_Settlements_pre_charge,
        (Case when c_pr.Date_Limit='2017-06-13' then 'Beyond - All history'
		          when datediff(day, c_pr.Date_Limit, getdate())=120 then 'Beyond - Last 120 days'
		          when datediff(day, c_pr.Date_Limit, getdate())=240 then 'Beyond - Last 240 days' end) DateLimit_PreCharge,
        -- Post Charge terms
        t_po.Most_Accepted_Ratio as Most_Accepted_Ratio_post_charge,
        t_po.Most_Accepted_Pays as Most_Accepted_Terms_post_Charge,
        s_po.Min_Monthly_Pay as Min_Monthly_Pay_post_charge,
        s_po.Total_Settlements as Total_Number_Settlements_post_charge,
        (Case when c_po.Date_Limit='2017-06-13' then 'Beyond - All history'
		          when datediff(day, c_po.Date_Limit, getdate())=120 then 'Beyond - Last 120 days'
		          when datediff(day, c_po.Date_Limit, getdate())=240 then 'Beyond - Last 240 days' end) DateLimit_PostCharge

--drop table asb.bct_delinquency
into ##temp_bct_delinquency

--Select Most Accepted ratio, and Most accepted creditor terms for most accepted ratio for pre charged settlements
from (Select tpr.Creditor, tpr.Most_Accepted_Ratio, tpr.Most_Accepted_Pays
        from (Select spr.Creditor, cr1.Most_Accepted_Ratio, spr.Number_of_CreditorPays as Most_Accepted_Pays,
                     ROW_NUMBER() OVER (Partition by  spr.Creditor order by count(spr.OfferID) desc, spr.Number_of_CreditorPays desc) Is_Most_Accepted_Pays
              from (Select spr.Creditor, spr.Accepted_Ratio as Most_Accepted_Ratio,
                           ROW_NUMBER() OVER (Partition by spr.Creditor order by count(spr.OfferID) desc, spr.Accepted_Ratio desc) Is_Most_Accepted_Ratio
                    from Settlements_pre_charge spr
                    group by spr.Creditor, spr.Accepted_Ratio
                    ) cr1
               join Settlements_pre_charge spr on spr.Creditor = cr1.Creditor
                                                  and spr.Accepted_ratio = cr1.Most_Accepted_Ratio
               where cr1.Is_Most_Accepted_Ratio = 1
               group by spr.Creditor, cr1.Most_Accepted_Ratio , spr.Number_of_CreditorPays
               ) tpr
        where Is_Most_Accepted_Pays = 1
        ) t_pr

left join (Select spr.Creditor, count(spr.OfferID) Total_Settlements,
                  case when min (case when spr.Min_Monthly_Payment ='evenpays' then 1000000000 else cast(Min_Monthly_Payment as int) end)  = 1000000000 then 'evenpays'
          						else cast( min (case when spr.Min_Monthly_Payment ='evenpays' then 1000000000 else cast(Min_Monthly_Payment as int) end) as varchar)
          					end Min_Monthly_Pay
          from Settlements_pre_charge spr
          group by spr.Creditor
          ) s_pr on s_pr.Creditor = t_pr.Creditor

left join Creditor_limit_Calc_below_180 c_pr on c_pr.Creditor = t_pr.Creditor

--Select Most Accepted ratio, and Most accepted creditor terms for most accepted ratio for post charged settlements
full join (Select tpo.Creditor, tpo.Most_Accepted_Ratio, tpo.Most_Accepted_Pays
            from (Select spo.Creditor, cr1.Most_Accepted_Ratio, spo.Number_of_CreditorPays as Most_Accepted_Pays,
                         ROW_NUMBER() OVER (Partition by  spo.Creditor order by count(spo.OfferID) desc, spo.Number_of_CreditorPays desc) Is_Most_Accepted_Pays
                  from (Select spo.Creditor, spo.Accepted_Ratio as Most_Accepted_Ratio,
                               ROW_NUMBER() OVER (Partition by  spo.Creditor order by count(spo.OfferID) desc, spo.Accepted_Ratio desc) Is_Most_Accepted_Ratio
                        from Settlements_post_charge spo
                        group by spo.Creditor, spo.Accepted_Ratio
                        ) cr1
                   join Settlements_post_charge spo on spo.Creditor = cr1.Creditor
                                                      and spo.Accepted_ratio = cr1.Most_Accepted_Ratio
                   where cr1.Is_Most_Accepted_Ratio = 1
                   group by spo.Creditor, cr1.Most_Accepted_Ratio , spo.Number_of_CreditorPays
                   ) tpo
            where Is_Most_Accepted_Pays = 1
            ) t_po on t_po.Creditor = t_pr.Creditor

left join (Select  spo.Creditor, count(spo.OfferID) Total_Settlements,
                  case when min (case when spo.Min_Monthly_Payment ='evenpays' then 1000000000 else cast(spo.Min_Monthly_Payment as int) end)  = 1000000000 then 'evenpays'
          						else cast( min (case when spo.Min_Monthly_Payment ='evenpays' then 1000000000 else cast(spo.Min_Monthly_Payment as int) end) as varchar)
          					end Min_Monthly_Pay
          from Settlements_post_charge spo
          group by spo.Creditor
          ) s_po on s_po.Creditor = t_po.Creditor

left join Creditor_limit_Calc_above_180 c_po on c_po.Creditor = t_po.Creditor
;

Select  ISNULL(t_pr.Creditor,t_po.Creditor) as Creditor,
        t_pr.most_accepted_ratio_pre_charge,
        t_pr.most_accepted_terms_pre_charge,
        t_pr.min_monthly_pay_pre_charge,
        t_pr.total_number_settlements_pre_charge,
        t_pr.datelimit_precharge,
        t_po.most_accepted_ratio_post_charge,
        t_po.most_accepted_terms_post_charge,
        t_po.min_monthly_pay_post_charge,
        t_po.total_number_settlements_post_charge,
        t_po.datelimit_postcharge

into ##temp_merged_ct_delinquency
from (Select ISNULL(upper(c.creditor),cs.Creditor_UC,bf.Creditor) as Creditor,
               case when c.creditor is not null then c.most_accepted_ratio_pre_charge
                    when bf.Creditor is null then cs.most_accepted_ratio_pre_charge
                    when cs.Creditor_UC is null then bf.most_accepted_ratio_pre_charge
                    when bf.total_number_settlements_pre_charge >= 5 then bf.most_accepted_ratio_pre_charge
                    when cs.total_number_settlements_pre_charge >= 5 then cs.most_accepted_ratio_pre_charge
                    else bf.most_accepted_ratio_pre_charge
               end as most_accepted_ratio_pre_charge,
               case when c.creditor is not null then c.most_accepted_terms_pre_charge
                    when bf.Creditor is null then cs.most_accepted_terms_pre_charge
                    when cs.Creditor_UC is null then bf.most_accepted_terms_pre_charge
                    when bf.total_number_settlements_pre_charge >= 5 then bf.most_accepted_terms_pre_charge
                    when cs.total_number_settlements_pre_charge >= 5 then cs.most_accepted_terms_pre_charge
                    else bf.most_accepted_terms_pre_charge
               end as most_accepted_terms_pre_charge,
               case when c.creditor is not null then c.min_monthly_pay_pre_charge
                    when bf.Creditor is null then cs.min_monthly_pay_pre_charge
                    when cs.Creditor_UC is null then bf.min_monthly_pay_pre_charge
                    when bf.total_number_settlements_pre_charge >= 5 then bf.min_monthly_pay_pre_charge
                    when cs.total_number_settlements_pre_charge >= 5 then cs.min_monthly_pay_pre_charge
                    else bf.min_monthly_pay_pre_charge
               end as min_monthly_pay_pre_charge,
               case when bf.Creditor is null then cs.total_number_settlements_pre_charge
                    when cs.Creditor_UC is null then bf.total_number_settlements_pre_charge
                    when bf.total_number_settlements_pre_charge >= 5 then bf.total_number_settlements_pre_charge
                    when cs.total_number_settlements_pre_charge >= 5 then cs.total_number_settlements_pre_charge
                    else bf.total_number_settlements_pre_charge
               end as total_number_settlements_pre_charge,
               case when bf.Creditor is null then cs.dl_pre
                    when cs.Creditor_UC is null then bf.datelimit_precharge
                    when bf.total_number_settlements_pre_charge >= 5 then bf.datelimit_precharge
                    when cs.total_number_settlements_pre_charge >= 5 then cs.dl_pre
                    else bf.datelimit_precharge
               end as datelimit_precharge
        from( Select * , UPPER(Creditor) as Creditor_UC
              from (Select c.creditor,
                           c.most_accepted_ratio_pre_charge,c.most_accepted_terms_pre_charge, c.min_monthly_pay_pre_charge, c.total_number_settlements_pre_charge,c.dl_pre,
                           c.most_accepted_ratio_post_charge,c.most_accepted_terms_post_charge,c.min_monthly_pay_post_charge, c.total_number_settlements_post_charge, c.dl_post
                    from asb.csct c

                    union
                    --creditor alias mappings to Beyond and S&N
                    Select m.Beyond_creditor,
                           c.most_accepted_ratio_pre_charge,c.most_accepted_terms_pre_charge, c.min_monthly_pay_pre_charge, c.total_number_settlements_pre_charge,c.dl_pre,
                           c.most_accepted_ratio_post_charge,c.most_accepted_terms_post_charge,c.min_monthly_pay_post_charge, c.total_number_settlements_post_charge, c.dl_post
                    from asb.CSCT  c
                    join asb.creditor_mappings m on UPPER(m.SN_creditor) = UPPER(c.creditor)) cs
              where dl_pre is not null) cs
        full join(  Select *
                    from ##temp_bct_delinquency bf
                    where datelimit_precharge is not null
                  ) bf on bf.Creditor = cs.Creditor_UC
        left join asb.creditor c on (upper(c.creditor)=upper(bf.Creditor) )or (upper(c.creditor)=upper(cs.Creditor))
        ) t_pr
full join (Select ISNULL(upper(c.creditor),cs.Creditor_UC,bf.Creditor) as Creditor,
                   case when c.creditor is not null then c.most_accepted_ratio_post_charge
                        when bf.Creditor is null then cs.most_accepted_ratio_post_charge
                        when cs.Creditor_UC is null then bf.most_accepted_ratio_post_charge
                        when bf.total_number_settlements_post_charge >= 5 then bf.most_accepted_ratio_post_charge
                        when cs.total_number_settlements_post_charge >= 5 then cs.most_accepted_ratio_post_charge
                        else bf.most_accepted_ratio_post_charge
                   end as most_accepted_ratio_post_charge,
                   case when c.creditor is not null then c.most_accepted_terms_post_charge
                        when bf.Creditor is null then cs.most_accepted_terms_post_charge
                        when cs.Creditor_UC is null then bf.most_accepted_terms_post_charge
                        when bf.total_number_settlements_post_charge >= 5 then bf.most_accepted_terms_post_charge
                        when cs.total_number_settlements_post_charge >= 5 then cs.most_accepted_terms_post_charge
                        else bf.most_accepted_terms_post_charge
                   end as most_accepted_terms_post_charge,
                   case when c.creditor is not null then c.min_monthly_pay_post_charge
                        when bf.Creditor is null then cs.min_monthly_pay_post_charge
                        when cs.Creditor_UC is null then bf.min_monthly_pay_post_charge
                        when bf.total_number_settlements_post_charge >= 5 then bf.min_monthly_pay_post_charge
                        when cs.total_number_settlements_post_charge >= 5 then cs.min_monthly_pay_post_charge
                        else bf.min_monthly_pay_post_charge
                   end as min_monthly_pay_post_charge,
                   case when bf.Creditor is null then cs.total_number_settlements_post_charge
                        when cs.Creditor_UC is null then bf.total_number_settlements_post_charge
                        when bf.total_number_settlements_post_charge >= 5 then bf.total_number_settlements_post_charge
                        when cs.total_number_settlements_post_charge >= 5 then cs.total_number_settlements_post_charge
                        else bf.total_number_settlements_post_charge
                   end as total_number_settlements_post_charge,
                   case when bf.Creditor is null then cs.dl_post
                        when cs.Creditor_UC is null then bf.datelimit_postcharge
                        when bf.total_number_settlements_post_charge >= 5 then bf.datelimit_postcharge
                        when cs.total_number_settlements_post_charge >= 5 then cs.dl_post
                        else bf.datelimit_postcharge
                   end as datelimit_postcharge
            from( Select * , UPPER(Creditor) as Creditor_UC
                  from (Select c.creditor,
                               c.most_accepted_ratio_pre_charge,c.most_accepted_terms_pre_charge, c.min_monthly_pay_pre_charge, c.total_number_settlements_pre_charge,c.dl_pre,
                               c.most_accepted_ratio_post_charge,c.most_accepted_terms_post_charge,c.min_monthly_pay_post_charge, c.total_number_settlements_post_charge, c.dl_post
                        from asb.csct c

                        union
                        --creditor alias mappings to Beyond and S&N
                        Select m.Beyond_creditor,
                               c.most_accepted_ratio_pre_charge,c.most_accepted_terms_pre_charge, c.min_monthly_pay_pre_charge, c.total_number_settlements_pre_charge,c.dl_pre,
                               c.most_accepted_ratio_post_charge,c.most_accepted_terms_post_charge,c.min_monthly_pay_post_charge, c.total_number_settlements_post_charge, c.dl_post
                        from asb.CSCT c
                        join asb.creditor_mappings m on UPPER(m.SN_creditor) = UPPER(c.creditor)) cs
                  where dl_post is not null) cs
            full join(  Select *
                        from ##temp_bct_delinquency bf
                        where datelimit_postcharge is not null
                      ) bf on bf.Creditor = cs.Creditor_UC
            left join asb.creditor c on (upper(c.creditor)=upper(bf.Creditor) )or (upper(c.creditor)=upper(cs.Creditor))
           ) t_po on t_po.Creditor = t_pr.Creditor
;

select isnull(m.creditor,UPPER(c.creditor)) as Creditor,
       c.override_type,c.debt_type,c.min_debt,c.max_debt,
       isnull(c.most_accepted_ratio_pre_charge, m.most_accepted_ratio_pre_charge) as most_accepted_ratio_pre_charge,
       isnull(c.most_accepted_terms_pre_charge, m.most_accepted_terms_pre_charge) as most_accepted_terms_pre_charge,
       isnull(c.min_monthly_pay_pre_charge, m.min_monthly_pay_pre_charge) as min_monthly_pay_pre_charge,

       (case when c.most_accepted_ratio_pre_charge is null then m.total_number_settlements_pre_charge else null end) as total_number_settlements_pre_charge,
       (case when c.most_accepted_ratio_pre_charge is null then m.datelimit_precharge else null end) as  datelimit_precharge,

       isnull(c.most_accepted_ratio_post_charge, m.most_accepted_ratio_post_charge) as most_accepted_ratio_post_charge,
       isnull(c.most_accepted_terms_post_charge, m.most_accepted_terms_post_charge) as most_accepted_terms_post_charge,
       isnull(c.min_monthly_pay_post_charge, m.min_monthly_pay_post_charge) as min_monthly_pay_post_charge,

       (case when c.most_accepted_ratio_post_charge is null then m.total_number_settlements_post_charge else null end) as total_number_settlements_post_charge,
       (case when c.most_accepted_ratio_post_charge is null then m.datelimit_postcharge else null end) as  datelimit_postcharge

into ##temp_merged_ct_overrides
from ##temp_merged_ct_delinquency m
full join asb.creditor_overrides c on upper(c.creditor)=m.creditor
;

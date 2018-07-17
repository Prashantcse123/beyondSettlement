with pre_ct as (  --For each tradeline, we need to calculate FA for all terms.  splitting each term from below cte
                select distinct creditor,'precharge' as type, cr.most_accepted_terms_pre_charge as accepted_terms,override_type,debt_type,min_debt,max_debt,
                       cr.most_accepted_ratio_pre_charge as accepted_ratio, cr.min_monthly_pay_pre_charge as accepted_pay,
                       cj.term , last_day(dateadd(month,term-1,getdate())) as Target_Date , total_number_settlements_pre_charge as Data_Points
                from ##temp_merged_ct_overrides cr
                cross join (select row_number()over(order by creditor) as term from ##temp_merged_ct_overrides limit 100) cj
                where cr.most_accepted_terms_pre_charge is not null
                      and cr.most_accepted_terms_pre_charge >= cj.term

                union

                --Consider post charge terms for creditors who dont have pre charge terms
                select distinct creditor,'precharge' as type, cr.most_accepted_terms_post_charge as accepted_terms,override_type,debt_type,min_debt,max_debt,
                       cr.most_accepted_ratio_post_charge as accepted_ratio, cr.min_monthly_pay_post_charge as accepted_pay,
                       cj.term , last_day(dateadd(month,term-1,getdate())) as Target_Date , total_number_settlements_pre_charge as Data_Points
                from ##temp_merged_ct_overrides cr
                cross join (select row_number()over(order by creditor) as term from ##temp_merged_ct_overrides limit 100) cj
                where cr.most_accepted_terms_pre_charge is null
                      and cr.most_accepted_terms_post_charge is not null
                      and cr.most_accepted_terms_post_charge>=cj.term
                )

,post_ct as (  --For each tradeline, we need to calculate FA for all terms. So splitting each term from below cte
                select distinct creditor,'postcharge' as type, cr.most_accepted_terms_post_charge as accepted_terms,override_type,debt_type,min_debt,max_debt,
                       cr.most_accepted_ratio_post_charge as accepted_ratio, cr.min_monthly_pay_post_charge as accepted_pay,
                       cj.term , last_day(dateadd(month,term-1,getdate())) as Target_Date , total_number_settlements_post_charge as Data_Points
                from ##temp_merged_ct_overrides cr
                cross join (select row_number()over(order by creditor) as term from ##temp_merged_ct_overrides limit 100) cj
                where cr.most_accepted_terms_post_charge is not null
                      and cr.most_accepted_terms_post_charge>=cj.term

                union
                 --Consider pre charge terms for creditors who dont have post charge terms
                select distinct creditor,'postcharge' as type, cr.most_accepted_terms_pre_charge as accepted_terms,override_type,debt_type,min_debt,max_debt,
                       cr.most_accepted_ratio_pre_charge as accepted_ratio, cr.min_monthly_pay_pre_charge as accepted_pay,
                       cj.term , last_day(dateadd(month,term-1,getdate())) as Target_Date , total_number_settlements_post_charge as Data_Points
                from ##temp_merged_ct_overrides cr
                cross join (select row_number()over(order by creditor) as term from ##temp_merged_ct_overrides limit 100) cj
                where cr.most_accepted_terms_post_charge is null
                      and cr.most_accepted_terms_pre_charge is not null
                      and cr.most_accepted_terms_pre_charge >= cj.term
                )

,stl as (  -- Fetch all tradelines with pre defined conditions
          Select distinct stl.id as TradelineID, stl.nu_dse__Program__c as programid, stl.name as tradelinename, stl.nu_dse__New_Creditor__c as newcreditor, stl.nu_dse__Original_Creditor__c as originalcreditor, stl.*,
                sac.name as creditor,
                spg.ProgramName, spg.enrolled_state__c as State_Of_Residency, spg.nu_dse__Total_Debt_Included__c as Enrolled_Debt,
                d.delinquency as delinquency_limit,
                COALESCE(NULL,stl.nu_dse__current_balance__c,stl.nu_dse__original_debt__c) as YTP_balance,
                COALESCE(stl.nu_dse__current_balance__c,stl.nu_dse__original_debt__c) as Fee_Balance,
                DATEDIFF(day, ISNULL(stl.nu_dse__Last_Payment_Date__c, stl.createddate),GETDATE()) as Delinquency,
                isnull(s.credit_score, 5) as credit_score,
                isnull(stl.nu_dse__original_account_number__c,stl.nu_dse__new_account_number__c) as Account_Number,
                case when len(isnull(stl.nu_dse__original_account_number__c,stl.nu_dse__new_account_number__c)) between 16 and 19 then 'credit_card' else 'loan' end as debt_type
            from salesforce.nu_dse__tradeline__c stl --edw.dimtradeline_sf stl
            join (Select spg.id as programid, spg.name as ProgramName, spg.*
                  from salesforce.nu_dse__program__c spg --edw.dimprogram_SF spg
                   where
                         spg.createddate >  cast('2017-06-13'as date) and
                         (UPPER(spg.name) not like '%TEST%' or spg.name is null) and
                         (UPPER(spg.client_first_name__c) not like '%TEST%' or spg.client_first_name__c is null) and
                         (UPPER(spg.email_address__c) not like '%TEST%' or spg.email_address__c is null) and
                         spg.nu_dse__Account__c not in ('0014600000jaugGAAQ') and
                         UPPER(spg.nu_dse__program_status__c) not in ('CLOSED') and
                         UPPER(spg.nu_dse__program_status__c) not in ('TERMINATION PENDING','GRADUATION PENDING','TERMINATED')
                 ) spg on UPPER(spg.id) = UPPER(stl.nu_dse__Program__c)
            left join (Select * from salesforce.account) sac on UPPER(sac.id) = UPPER(case when stl.nu_dse__New_Creditor__c is null or stl.nu_dse__New_Creditor__c ='' then stl.nu_dse__Original_Creditor__c else stl.nu_dse__New_Creditor__c end)
            left join (Select * from salesforce.recordtype) src on UPPER(src.id) = UPPER(sac.recordtypeid)
            left join asb.creditor_scores s on upper(s.creditor)=upper(sac.name)
            left join asb.creditor_delinquency d on upper(d.creditor)=upper(sac.name)
            where src.name = 'Creditor' and stl.nu_dse__current_stage__c <> 'Removed' and stl.nu_dse__include_in_the_program__c = 1
                  and stl.id not in (Select nu_dse__TradeLine__c from salesforce.nu_dse__offer__c where nu_dse__Status__c in ('Accepted', 'Send To Accounting'))    --Filters already settled tradelines
                  and spg.isdeleted = 'false'    --Filters deleted programs and tradelines
                  and stl.nu_dse__Program__c not in (Select nu_dse__Program__c from salesforce.nu_dse__offer__c where nu_dse__Status__c = 'Canceled') --Removes tradelines of blown clients
             )

,pre_stl as (  -- Fetch tradelines with pre charge (If delinquency is give, it is considered, else 180 days is default delinquency)
             Select * from stl
             where delinquency < isnull(delinquency_limit,180)    -- Filters pre charge tradelines
             )

,post_stl as (  -- Fetch tradelines with pre charge (If delinquency is give, it is considered, else 180 days is default delinquency)
             Select * from stl
             where delinquency >= isnull(delinquency_limit,180)    -- Filters post charge tradelines
             )

,pre_clubbed as (--For creditors who have terms, we can calculate FA
             Select  stl.tradelineid,stl.tradelinename,stl.programname,stl.programid,upper(stl.creditor) as creditor,ct.accepted_ratio,
                     ct.accepted_terms,ct.accepted_pay,ct.term,stl.delinquency,  stl.credit_score,
                     stl.State_Of_Residency, stl.Enrolled_Debt, stl.nu_dse__Current_Stage__c, stl.lpoa_sent__c,
                     stl.YTP_balance as balance, (stl.YTP_balance*ct.accepted_ratio) as estimated_OfferAmt,
                     case when (stl.YTP_balance*ct.accepted_ratio)/stl.Fee_balance <= 0.75 then (stl.YTP_balance*ct.accepted_ratio) + (0.25 * stl.Fee_balance)                --25% VD as Fee
                          when (stl.YTP_balance*ct.accepted_ratio)/stl.Fee_balance > 0.75 and (stl.YTP_balance*ct.accepted_ratio)/stl.Fee_balance <= 1 then stl.Fee_balance   --amount, rest is fee
                          when (stl.YTP_balance*ct.accepted_ratio)/stl.Fee_balance > 1 then (stl.YTP_balance*ct.accepted_ratio)                     --No fee, only Offer amount
                          end as estimated_OfferAmt_TE,
                     stl.nu_dse__Last_Payment_Date__c,stl.createddate, stl.debt_type,
                     ct.Data_Points,stl.Account_Number,
                     last_day(dateadd(month,term-1,getdate())) as Target_Date , 'PR' as Type
             from pre_stl stl
             left join pre_ct ct on UPPER(stl.creditor)=upper(case when ct.override_type is null or ct.override_type='' then ct.creditor
                                                         when ct.override_type='credit-type' and ct.debt_type=stl.debt_type then ct.creditor
                                                         when ct.override_type='debt' and ct.max_debt is null and YTP_balance>= ct.min_debt then ct.creditor
                                                         when ct.override_type='debt' and ct.max_debt is not null and YTP_balance between ct.min_debt and ct.max_debt
                                                              then ct.creditor else null end)

             where accepted_ratio is not null -- Filter for fetching tradelines which have pre defined creditor terms

             union all

             -- For creditors who dont have any terms, we need to validate them for default terms :
             --6 terms, 60% Accepted ratio, Evenpays as accepted pays
             select stl.tradelineid,stl.tradelinename,stl.ProgramName,stl.programid,upper(stl.creditor) as creditor,
                    0.6 as accepted_ratio, 6 as accepted_terms, 'evenpays' as accepted_pay, t.term,stl.delinquency, stl.credit_score,
                    stl.State_Of_Residency, stl.Enrolled_Debt, stl.nu_dse__Current_Stage__c, stl.lpoa_sent__c,
                    YTP_balance as balance, (stl.YTP_balance*0.6) as estimated_OfferAmt,
                    case when (stl.YTP_balance*0.6)/stl.Fee_balance <= 0.75 then (stl.YTP_balance*0.6) + (0.25 * stl.Fee_balance)                --25% VD as Fee
                          when (stl.YTP_balance*0.6)/stl.Fee_balance > 0.75 and (stl.YTP_balance*0.6)/stl.Fee_balance <= 1 then stl.Fee_balance   -- Offer amount, rest is fee
                          when (stl.YTP_balance*0.6)/stl.Fee_balance > 1 then (stl.YTP_balance*0.6)                     --No fee, only Offer amount
                          end as estimated_OfferAmt_TE,
                    stl.nu_dse__Last_Payment_Date__c,stl.CreatedDate, stl.debt_type,
                    m.Data_Points, stl.Account_Number,
                    last_day(dateadd(month,t.term-1,getdate())) as Target_Date  , 'PR' as Type
             from pre_stl stl
             cross join (select row_number()over(order by creditor) as term from pre_ct limit 6) t
             left join  pre_ct m on UPPER(stl.creditor)=upper(case when m.override_type is null or m.override_type='' then m.creditor
                                                             when m.override_type='credit-type' and m.debt_type=stl.debt_type then m.creditor
                                                             when m.override_type='debt' and m.max_debt is null and YTP_balance>= m.min_debt then m.creditor
                                                             when m.override_type='debt' and m.max_debt is not null and YTP_balance between m.min_debt and m.max_debt then m.creditor
                                                         else null end)
             where m.accepted_terms is null   -- Filter for fetching tradelines with no creditor terms
            )

,post_clubbed as (--For creditors who have terms, we can calculate FA
             Select  stl.tradelineid,stl.tradelinename,stl.ProgramName,stl.programid,upper(stl.creditor) as creditor,ct.accepted_ratio,
                     ct.accepted_terms,ct.accepted_pay,ct.term, stl.delinquency, stl.credit_score,
                     stl.State_Of_Residency, stl.Enrolled_Debt, stl.nu_dse__Current_Stage__c, stl.lpoa_sent__c,
                     YTP_balance as balance,(stl.YTP_balance*ct.accepted_ratio) as estimated_OfferAmt,
                     case when (stl.YTP_balance*ct.accepted_ratio)/stl.Fee_balance <= 0.75 then (stl.YTP_balance*ct.accepted_ratio) + (0.25 * stl.Fee_balance)                --25% VD as Fee
                          when (stl.YTP_balance*ct.accepted_ratio)/stl.Fee_balance > 0.75 and (stl.YTP_balance*ct.accepted_ratio)/stl.Fee_balance <= 1 then stl.Fee_balance   -- Offer amount, rest is fee
                          when (stl.YTP_balance*ct.accepted_ratio)/stl.Fee_balance > 1 then (stl.YTP_balance*ct.accepted_ratio)                     --No fee, only Offer amount
                          end as estimated_OfferAmt_TE,
                     stl.nu_dse__Last_Payment_Date__c,stl.CreatedDate, stl.debt_type,
                     ct.Data_Points, stl.Account_Number,
                     last_day(dateadd(month,term-1,getdate())) as Target_Date  , 'PO' as Type
             from post_stl stl
             left join post_ct ct on UPPER(stl.creditor)=upper(case when ct.override_type is null or ct.override_type='' then ct.creditor
                                                         when ct.override_type='credit-type' and ct.debt_type=stl.debt_type then ct.creditor
                                                         when ct.override_type='debt' and ct.max_debt is null and YTP_balance>= ct.min_debt then ct.creditor
                                                         when ct.override_type='debt' and ct.max_debt is not null and YTP_balance between ct.min_debt and ct.max_debt
                                                              then ct.creditor else null end)

             where accepted_ratio is not null -- Filter for fetching tradelines which have pre defined creditor terms

             union all

             -- For creditors who dont have any terms, we need to validate them for default terms :
             --6 terms, 60% Accepted ratio, Evenpays as accepted pays
             select stl.tradelineid, stl.tradelinename,stl.ProgramName,stl.programid,upper(stl.creditor) as creditor,
                    0.6 as accepted_ratio, 6 as accepted_terms, 'evenpays' as accepted_pay, t.term, stl.delinquency, stl.credit_score,
                    stl.State_Of_Residency, stl.Enrolled_Debt, stl.nu_dse__Current_Stage__c, stl.lpoa_sent__c,
                    YTP_balance as balance, (stl.YTP_balance*0.6) as estimated_OfferAmt,
                    case when (stl.YTP_balance*0.6)/stl.Fee_balance <= 0.75 then (stl.YTP_balance*0.6) + (0.25 * stl.Fee_balance)                --25% VD as Fee
                          when (stl.YTP_balance*0.6)/stl.Fee_balance > 0.75 and (stl.YTP_balance*0.6)/stl.Fee_balance <= 1 then stl.Fee_balance   -- Offer amount, rest is fee
                          when (stl.YTP_balance*0.6)/stl.Fee_balance > 1 then (stl.YTP_balance*0.6)                     --No fee, only Offer amount
                          end as estimated_OfferAmt_TE,
                    stl.nu_dse__Last_Payment_Date__c,stl.CreatedDate, stl.debt_type,
                    m.Data_Points, stl.Account_Number,
                    last_day(dateadd(month,t.term-1,getdate())) as Target_Date   , 'PO' as Type
             from post_stl stl
             cross join (select row_number()over(order by creditor) as term from post_ct limit 6) t
             left join  post_ct m on UPPER(stl.creditor)=upper(case when m.override_type is null or m.override_type='' then m.creditor
                                                             when m.override_type='credit-type' and m.debt_type=stl.debt_type then m.creditor
                                                             when m.override_type='debt' and m.max_debt is null and YTP_balance>= m.min_debt then m.creditor
                                                             when m.override_type='debt' and m.max_debt is not null and YTP_balance between m.min_debt and m.max_debt then m.creditor
                                                         else null end)
             where m.accepted_terms is null   -- Filter for fetching tradelines with no creditor terms
            )

,fund_accumulation as (Select nu_dse__Program__c as programid ,sum(case when sp.nu_dse__Payment_Type__c = 'Deposit' then sp.nu_dse__Amount__c else -sp.nu_dse__Amount__c end ) as fund_in_CFT
                   from salesforce.nu_dse__payment__c sp
                   where (sp.nu_dse__Transaction_Status__c in ('Completed','Cleared')
                                or (sp.nu_dse__Transaction_Status__c = 'In Progress' and sp.nu_dse__Payment_Type__c <> 'Deposit')
                              )
                   group by nu_dse__Program__c
                  )

,future_funds as ( Select sp.nu_dse__Program__c as programid, sp.nu_dse__Schedule_Date__c as scheduledate, sp.nu_dse__Payment_Type__c as paymenttype, sp.nu_dse__Transaction_Status__c as transactionstatus,
                          (case when sp.nu_dse__Payment_Type__c='Deposit' then sp.nu_dse__Amount__c else -sp.nu_dse__Amount__c end) as tran_amount
                   from salesforce.nu_dse__payment__c sp
                   where date(getdate()) <= date(sp.nu_dse__Schedule_Date__c)
                         and (sp.nu_dse__Transaction_Status__c in ('Pending', 'Scheduled')
                              or (sp.nu_dse__Transaction_Status__c = 'In Progress' and sp.nu_dse__Payment_Type__c = 'Deposit' and date(getdate()) <= date(sp.nu_dse__Schedule_Date__c))
                              )
                  )

,final_tradelines as (Select *,case when (stl.term = CEILING(estimated_OfferAmt_TE*1.00/ Estimated_EMI)  or stl.term = stl.accepted_terms)
                                    then stl.estimated_OfferAmt_TE
                                    else sum(Estimated_EMI) over (partition by stl.tradelinename order by stl.term rows unbounded preceding)
                               end as Month_end_EMI ,
                               cast(CEILING(estimated_OfferAmt_TE*1.00/ Estimated_EMI) as int) as calc_terms
                        from (select c.*,
                                     case when c.accepted_pay='evenpays' then estimated_OfferAmt/c.accepted_terms
                                          when cast(c.accepted_pay as int) > estimated_OfferAmt then estimated_OfferAmt
                                          when cast(c.accepted_pay as int) >= (0.05*estimated_OfferAmt) then cast(c.accepted_pay as int)
                                          when cast(c.accepted_pay as int) < (0.05*estimated_OfferAmt) then (0.05*estimated_OfferAmt)
                                     else null end as Estimated_EMI
                             from (Select * from pre_clubbed
                                   union all
                                   Select * from post_clubbed) c -- Calculate EMI for pre and post charge accounts
                             ) stl
                        where (accepted_pay = 'evenpays' or term <= CEILING(estimated_OfferAmt_TE/ Estimated_EMI))
                       )

--Actual Select starts here
select programname,tradelinename,creditor,delinquency as Account_Delinquency,
       Balance, Fee, m0_bal, ((m0_bal/NULLIF(Fee,0))*100) as fee_funded_pct,
       (m0_bal*1.00/Balance) as m0_bal_percent , (m5_bal*1.00/Balance) as m5_bal_percent ,
       (m12_bal*1.00/Balance) as m12_bal_percent, (term_end_bal*1.00/Balance) as term_end_bal_percent,
       Account_Status, Tradeline_Last_Negotiated, accepted_ratio,accepted_terms,accepted_pay,
       concat(concat(concat(cast(cast(accepted_ratio*100 as int) as varchar(100)),'%  over '),
                     concat(cast(accepted_terms as varchar(5)), ' months ')),
              case when accepted_pay = 'evenpays' then 'with evenpays'
                   else ' ' --concat(concat('$',accepted_pay), ' min pay')
                   end) as Creditor_Terms,
       Data_Points,  debt_type,
          case when  tradelinename_fa is null and ((((m0_bal/NULLIF(Fee,0))*100) < 0) or (((m0_bal/NULLIF(Fee,0))*100) IS NULL)) then 'not eligible(fa)' -- These tradelines have negative funds in their terms if we settle them
            when  (UPPER(creditor) in ('CITIBANK','CITI CARDS','SEARS', 'MACYS', 'BEST BUY', 'COSTCO', 'HOME DEPOT', 'TRACTOR SUPPLY', 
                                     'GOOD YEAR', 'BLOOMINGDALES', 'EXXON', 'SHELL', 'BROOKS BROTHERS')
                                     OR UPPER(creditor) like '%/CITI' OR UPPER(creditor) like '%/CITIBANK')
                  and (lpoa_sent__c <> true or lpoa_sent__c is null)
                  then 'not eligible(lpoa)'
            when  (credit_score <= 6 and delinquency <= 99) then 'not eligible(cs_d)'
            when  (UPPER(creditor) in ('WELLS FARGO','DISCOVER','US BANK','CAPITAL ONE','CAP ONE')
                  OR UPPER(creditor) like '%/CAPONE' OR UPPER(creditor) like '%/DISCOVER'
                  and UPPER(debt_type) = 'LOAN'
                  and DATEDIFF(day, ISNULL(nu_dse__Last_Payment_Date__c,CreatedDate),GETDATE())< 180)
                  then 'not eligible(loan)'
            when  (UPPER(creditor) in ('AMERICAN EXPRESS','US BANK','ELAN FINANCIAL','KROGER') OR UPPER(creditor) like '%/AMEX' OR UPPER(creditor) like '%/AMERICAN EXPRESS%' OR UPPER(creditor) like '%/AMERICAN EXPRESS'
                  and DATEDIFF(day, ISNULL(nu_dse__Last_Payment_Date__c,CreatedDate),GETDATE())< 90)
                  then 'not eligible'
            when count(case when eligible_terms=true then 1 else null end)=max(term) then 'eligible'
       else 'not eligible'
       end as Eligibility ,
       credit_score, State_Of_Residency,  avg_monthly_payment, Enrolled_Debt, Type

from (
        Select stl.TradelineName, stl.ProgramName, stl.programid, stl.State_Of_Residency, stl.Enrolled_Debt,
               stl.nu_dse__Current_Stage__c as Account_Status, amp.avg_monthly_payment, stl.credit_score,
               stl.accepted_ratio, stl.accepted_terms,stl.accepted_pay,stl.term, stl.creditor,
               (stl.estimated_OfferAmt_TE - stl.estimated_OfferAmt) as Fee,
               stl.balance,stl.estimated_OfferAmt,stl.estimated_OfferAmt_TE,nu_dse__Last_Payment_Date__c,stl.CreatedDate,
               stl.Estimated_EMI, stl.Month_end_EMI,stl.debt_type, stl.lpoa_sent__c,
               isnull(fa.fund_in_CFT,0) fund_in_CFT , isnull(fa1.MonthEnd_FA,0) MonthEnd_FA, stl.Target_Date, stl.delinquency,
               tln.createdDate as Tradeline_Last_Negotiated, Account_Number,
               (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m0_bal,0)) as m0_bal,
               (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m5_bal,0)) as m5_bal,
               (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.m12_bal,0)) as m12_bal,
               (ISNULL(fa.fund_in_CFT,0)+ ISNULL(io.term_end_bal,0)) as term_end_bal,
               case when stl.Month_end_EMI <= (isnull(fa.fund_in_CFT,0) + isnull(fa1.MonthEnd_FA,0)) then true else false end as eligible_terms,
               stl.Type, stl.Data_Points, sch_fund.tradelinename as tradelinename_fa --All fund accumulations are +ve for these programs

        --calculating estimated offer amount & monthly EMI
        /*
        ******************************Estimated EMI**********************************************************
        ***For even pays, split offer amount equally for all terms
        ***For min pays, if min pay > offer amount then offer amount is considered as EMI
        ***              if min pay < offer amount and min pay > 5% offer amount then, min pay is considered as EMI
        ***              if min pay < 5% offer amount then, 5% offer amount is considered as EMI

        ******************************Monthly EMI(Running sum or Aggregate)**********************************************************
        ***For last term  --> Offer amount is Monthly EMI
        ***For other terms--> For even pays, Running sum(estimated EMI) is Monthly EMI
        ***               --> For min pays, if Running sum(estimated EMI) > offer amount then, Monthly EMI is calculated for reduced terms
        ***               --> For min pays, if Running sum(estimated EMI) < offer amount then, Monthly EMI is calculated for all terms
        */
        from final_tradelines stl

        --Fund accumulation till date
        left join fund_accumulation fa on fa.programid = stl.programid

        --Future fund accumulations  ( in's and out's)
        left join ( Select pg.tradelinename, pg.programid, pg.Target_Date, sum(ff.tran_amount) as MonthEnd_FA
                    from (Select * from pre_clubbed
                          union all
                          Select * from post_clubbed) pg  --Calculate Fund accumulation for all terms (per tradeline)
                    join future_funds ff on ff.programid = pg.programid
                                            and date(ff.scheduledate) <= date(pg.Target_Date)
                    group by pg.tradelinename,pg.programid, pg.Target_Date
                 ) fa1 on fa1.tradelinename = stl.tradelinename
                          and fa1.programid = stl.programid
                          and fa1.Target_Date = stl.Target_Date

        -- All months fund accumulations after term must be positive after deducting estimated offer amount
       left join ( Select tl.tradelinename, tl.programid, count(remaining_fund) as total_funds,
                           sum(case when remaining_fund > 0 then 1 else 0 end) as positive_funds
                    from (Select fa.*,tl.tradelinename, (isnull(Fund_EOM,0) - isnull(estimated_OfferAmt_TE,0)) as remaining_fund
                          from (Select mon.trgt_month, ff.programid,
                                       isnull(fa.fund_in_CFT,0) + sum (tran_amount) as Fund_EOM -- sum up to get month end fund accumulation
                                from  future_funds ff
                                left join fund_accumulation fa on fa.programid = ff.programid
                                join (Select distinct programid, last_day(scheduledate) as trgt_month --Calculate distinct months with emi
                                      from future_funds
                                      ) mon on mon.programid = ff.programid
                                               and ff.scheduledate <= mon.trgt_month -- having cumulative fund accumulation at end of all months
                                --where ff.programid = 'a0L46000000rbXlEAI'
                                group by mon.trgt_month, ff.programid, fa.fund_in_CFT
                                ) fa
                          join (Select tradelinename, programid,  estimated_OfferAmt_TE, max(term) as settlement_term_calculated
                                from final_tradelines
                                group by tradelinename, programid,  estimated_OfferAmt_TE
                                ) tl on tl.programid = fa.programid
                                        and last_day(date_add('month',tl.settlement_term_calculated,getdate())) <= fa.trgt_month
                          ) tl
                    group by tl.tradelinename, tl.programid
                   ) sch_fund on sch_fund.tradelinename = stl.tradelinename
                                 and  total_funds = positive_funds

        -- calculating avg monthly payment by program
        left join (Select sp.nu_dse__Program__c as programid, sum(sp.nu_dse__Amount__c)/ count(distinct last_day(sp.nu_dse__Schedule_Date__c)) as avg_monthly_payment
                   from salesforce.nu_dse__payment__c sp
                   where sp.nu_dse__Payment_Type__c = 'Deposit'
                          and sp.nu_dse__Transaction_Status__c in ('Completed','Cleared')
                   group by sp.nu_dse__Program__c) amp on stl.programid = amp.programid

        --Tradeline last negotiated on(Not Processed)
        left join (Select so.nu_dse__TradeLine__c as tradeline, so.*,row_number() over (partition by so.nu_dse__TradeLine__c order by so.createddate desc) is_last_negotiation
                   from salesforce.nu_dse__offer__c so
                   join final_tradelines stl on stl.tradelineid = so.nu_dse__TradeLine__c
                   ) tln on tln.tradeline = stl.tradelineID and is_last_negotiation = 1

        --Estimated Pending ins and outs till this,6,12,termend
        left join (Select stl.tradelineid ,
                          sum(case when date(scheduledate) between date(getdate()) and last_day(GETDATE()) then tran_amount else 0 end ) as m0_bal,
                          sum(case when date(scheduledate) between date(getdate()) and last_day(DATEADD(MONTH,5,GETDATE())) then tran_amount else 0 end ) as m5_bal,
                          sum(case when date(scheduledate) between date(getdate()) and last_day(DATEADD(MONTH,12,GETDATE())) then tran_amount else 0 end ) as m12_bal,
                          sum(case when date(scheduledate) between date(getdate()) and last_day(DATEADD(MONTH,stl.accepted_terms-1,GETDATE())) then tran_amount else 0 end ) as term_end_bal
                   from future_funds ff
                   join (Select distinct tradelineid, programid, accepted_terms from final_tradelines) stl on stl.programid = ff.programid
                   group by stl.tradelineid
                   ) io on io.tradelineid = stl.tradelineid

where stl.programid not in (Select programid from stl
                            where UPPER(nu_dse__Current_Stage__c) in ('BANK LEVY', 'GARNISHMENT', 'JUDGMENT','SUMMONS RECEIVED')
                            )   --Filter out tradelines from litigated clients

 )
group by programname,tradelinename,creditor, delinquency, Balance, estimated_OfferAmt_TE, estimated_OfferAmt,
         m0_bal, m5_bal ,m12_bal , term_end_bal, Fee, Account_Status, Tradeline_Last_Negotiated, lpoa_sent__c,
         accepted_ratio,accepted_terms,accepted_pay,  Data_Points, Account_Number, tradelinename_fa, credit_score,
         debt_type, nu_dse__Last_Payment_Date__c, CreatedDate,  State_Of_Residency,  avg_monthly_payment, Enrolled_Debt, Type

;

select id, phone, channels_count from staff.phone where id in (
    select phone_id from staff.phone_in_employee where employee_id = 637279
) and protocol = 'SIP' limit 1
/*select channels_count from staff.phone where id = (
    select phone_id from staff.phone_in_employee where employee_id = 636855
)*/

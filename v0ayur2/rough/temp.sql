select * from tab;
SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = 21;

select * from users;
select * from patients;

delete from users where email not like '%admin%' and email not like '%doctor%';
delete from patients where user_id not in (select id from users where email like '%admin%' or email like '%doctor%');


commit;
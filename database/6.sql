select 
	user.user_id,
	name,
    coalesce(posts_count, 0) posts_count
from
	(select 
		user_id,
        count(*) posts_count
	from post
	where date_format(created_at, '%d-%m') = '01-03'
    group by user_id) posts_counted
right join user on user.user_id = posts_counted.user_id

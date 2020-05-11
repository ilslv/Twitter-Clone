select name
from
	(select 
		name,
		count(*) posts_count
	from post
	inner join user on user.user_id = post.user_id
	where date(created_at) = curdate()
	group by name) posts_counted
where posts_count > 3
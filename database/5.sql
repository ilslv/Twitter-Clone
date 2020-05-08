select
	user_id,
	name
from
	(select
		user.user_id,
		name,
		count(*) posts_count
	from post
	inner join user
	on post.user_id = user.user_id
	group by name) as posts_counted
where posts_count > 3

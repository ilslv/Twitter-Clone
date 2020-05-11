select
	datediff(curdate(), date(created_at)) days_since_first_post
from post
order by created_at
limit 1
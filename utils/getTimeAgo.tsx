export const getTimeAgo = (startTime: string) => {
	const currentTime = new Date();
	const signalTime = new Date(startTime);
	const diffInMs = currentTime.getTime() - signalTime.getTime();
	const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

	if (diffInMinutes < 60) {
		return `${diffInMinutes} mins ago`;
	}
	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
	}
	const diffInDays = Math.floor(diffInHours / 24);
	return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
};

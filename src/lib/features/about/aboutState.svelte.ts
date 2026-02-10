class AboutState {
	guestbookFormOpen = $state<boolean>(false);
	githubStats = $state<{ repos: number; followers: number; stars: number }>({
		repos: 0,
		followers: 0,
		stars: 0
	});

	toggleGuestbookForm(value?: boolean) {
		if (value !== undefined) {
			this.guestbookFormOpen = value;
		} else {
			this.guestbookFormOpen = !this.guestbookFormOpen;
		}
	}

	async fetchStats() {
		try {
			const res = await fetch('https://api.github.com/users/ginkohub');
			const data = await res.json();
			this.githubStats.repos = data.public_repos;
			this.githubStats.followers = data.followers;

			// Fetch stars
			const reposRes = await fetch('https://api.github.com/users/ginkohub/repos?per_page=100');
			const reposData = await reposRes.json();
			this.githubStats.stars = reposData.reduce(
				(acc: number, repo: any) => acc + repo.stargazers_count,
				0
			);
		} catch (e) {
			console.error('Failed to fetch stats', e);
		}
	}
}

export const aboutState = new AboutState();

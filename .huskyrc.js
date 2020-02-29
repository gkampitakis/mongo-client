const tasks = commands => commands.join(' && ');

module.exports = {
	hooks: {
		'pre-commit': tasks(['npm run format', 'echo "Formatting Code"']),
		'pre-push': tasks(['npm t', 'echo "Pushing Verified Branch"'])
	}
};

Feature: Page Title Updates
	As a user
	I want the browser page title to change based on the page I'm viewing
	So that I can distinguish between multiple tabs and use browser history effectively

# Related to TC-3370: Page title does not change based on viewed page
# The ensures page titles update when navigating to different pages

# Verify page titles for main application pages
Scenario Outline: Verify page title changes when navigating to <page> page
	When User navigates to "<page>" page
	Then the page title should contain "<expectedTitle>"

	Examples:
		| page            | expectedTitle   |
		| Dashboard       | Home            |
		| All SBOMs       | SBOMs           |
		| Advisories      | Advisories      |
		| Vulnerabilities | Vulnerabilities |
		| Packages        | Packages        |
		| Importers       | Importers       |

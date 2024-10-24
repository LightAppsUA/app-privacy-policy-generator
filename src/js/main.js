/*  
	App Privacy Policy Generator: A simple web app to generate a generic 
	privacy policy for your Android/iOS apps

	Copyright 2017-Present Nishant Srivastava

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var app = new Vue({
	el: "#app",
	data: {
		iOrWe: "[I/We]",
		typeOfApp: "Freemium",
		typeOfAppTxt: "[open source/free/freemium/ad-supported/commercial]",
		typeOfDev: "Individual",
		appName: "",
		appContact: "",
		devName: "",
		companyName: "",
		devOrCompanyName: "[Developer/Company name]",
		pidInfoIn: "",
		pidInfo:
			"[add whatever else you collect here, e.g. users name, address, location, pictures]",
		osType: "iOS",
		effectiveFromDate: new Date().toISOString().slice(0, 10),
		requirementOfSystem: "system",
		thirdPartyServices: thirdPartyServicesJsonArray,
		showPrivacyModal: false,
		showGDPRPrivacyModal: false,
		showTermsModal: false,
		showDisclaimerModal: false,
		showFaqModal: false,
		showNoTrackingPrivacyPolicyModal: false,
		hasThirdPartyServicesSelected: true,
		contentRenderType: 1, // contentRenderType=1 is Preview, contentRenderType=2 is HTML/Markdown
		wizardStep: 1,
		totalWizardSteps: 7,
		typeOfPolicy: 'Simple',
		typeOfPolicyInt: 1,
		isLocationTracked: false,
	},
	filters: {
		capitalize: function (value) {
			if (!value) return ''
			value = value.toString()
			return value.charAt(0).toUpperCase() + value.slice(1)
		}
	},
	methods: {
		showPrivacyModal: function () {
			this.showPrivacyModal = true
		},
		showNoTrackingPrivacyPolicyModal: function () {
			this.showNoTrackingPrivacyPolicyModal = true
		},
		showGDPRPrivacyModal: function () {
			this.showGDPRPrivacyModal = true
		},
		preview: function (id) {
			this.contentRenderType = 1
		},

		setTypeOfPolicyInt: function () {
			switch (this.typeOfPolicy) {
				case "Simple":
					this.typeOfPolicyInt = 1
					break
				case "No Tracking":
					this.typeOfPolicyInt = 2
					break
				case "GDPR":
					this.typeOfPolicyInt = 3
					break
			}
		},
		nextStep: function () {
			this.wizardStep += 1
		},
		prevStep: function () {
			this.wizardStep -= 1
		},
		checkForThirdPartyServicesEnabled: function () {
			let listOfEnabledThirdPartyServices = []
			this.thirdPartyServices.forEach((item) => {
				if (item[item.model] == true) {
					listOfEnabledThirdPartyServices.push(true)
				}
			})

			return listOfEnabledThirdPartyServices.length > 0
		},
		toggleState: function (item) {
			let state = item.model

			// For reactive update of the json
			// Toggle the state
			Vue.set(thirdPartyServicesJsonArray, item.model, !item[state])
		},
		getHtml: function (id, target) {
			let content = getContent(id)
			let title = getTitle(id)
			let rawHTML = getRawHTML(content, title)
			this.contentRenderType = 2
			loadInTextView(target, rawHTML)
		},
		downloadHtml: function (id) {
			let content = getContent(id)
			let title = getTitle(id)
			let rawHTML = getRawHTML(content, title)

			// Clean up appName by removing spaces and special characters
			let cleanAppName = this.appName.replace(/[^a-zA-Z0-9]/g, '')

			// Determine file suffix based on title content
			let fileSuffix
			if (title.toLowerCase().includes("privacy")) {
				fileSuffix = "_PrivacyPolicy.html"
			} else if (title.toLowerCase().includes("terms")) {
				fileSuffix = "_TermsOfUse.html"
			} else {
				fileSuffix = "_Document.html" // Default case if neither "privacy" nor "terms"
			}

			// Create a Blob from the HTML content
			let blob = new Blob([rawHTML], { type: "text/html" })

			// Create a temporary link element for downloading
			let downloadLink = document.createElement("a")
			downloadLink.href = URL.createObjectURL(blob)
			downloadLink.download = cleanAppName + fileSuffix // Use the appropriate file name suffix

			// Simulate a click on the link to trigger the download
			downloadLink.click()

			// Clean up the object URL
			URL.revokeObjectURL(downloadLink.href)
		},
		getMarkdown: function (id, target) {
			let content = getContent(id)
			let title = getTitle(id)
			let rawHTML = getRawHTML(content, title)
			let markdown = convertHtmlToMd(rawHTML)
			this.contentRenderType = 2
			loadInTextView(target, markdown)
		},
		generate: function () {
			// Dev/Company Name
			if (this.typeOfDev === "Individual") {
				this.devOrCompanyName = this.devName
			} else if (this.typeOfDev === "Company") {
				this.devOrCompanyName = this.companyName
			}

			// PID Info
			if (this.pidInfoIn === "") {
				this.pidInfo = "."
			} else {
				this.pidInfo = ", including but not limited to " + this.pidInfoIn + "."
			}

			switch (this.typeOfApp) {
				case "Free":
				case "Freemium":
				case "Commercial":
					this.typeOfAppTxt = "a " + this.typeOfApp
					break
				case "Open Source":
				case "Ad Supported":
					this.typeOfAppTxt = "an " + this.typeOfApp
					break
			}

			switch (this.osType) {
				case "Android": {
					this.osType = "Android"
					this.requirementOfSystem = "system"
					break
				}
				case "iOS": {
					this.osType = "iOS"
					this.requirementOfSystem = "system"
					break
				}
				case "Android & iOS": {
					this.osType = "Android & iOS"
					this.requirementOfSystem = "both systems"
					break
				}
			}
		},
		toggleNoTrackingPrivacyPolicyModalVisibility: function () {
			this.generate()
			this.contentRenderType == 1
			this.showNoTrackingPrivacyPolicyModal = !this.showNoTrackingPrivacyPolicyModal
		},
		togglePrivacyModalVisibility: function () {
			this.generate()
			this.hasThirdPartyServicesSelected = this.checkForThirdPartyServicesEnabled()
			this.contentRenderType = 1
			this.showPrivacyModal = !this.showPrivacyModal
		},
		toggleGDPRPrivacyModalVisibility: function () {
			this.generate()
			this.hasThirdPartyServicesSelected = this.checkForThirdPartyServicesEnabled()
			this.contentRenderType = 1
			this.showGDPRPrivacyModal = !this.showGDPRPrivacyModal
		},
		toggleTermsModalVisibility: function () {
			this.generate()
			this.hasThirdPartyServicesSelected = this.checkForThirdPartyServicesEnabled()
			this.contentRenderType = 1
			this.showTermsModal = !this.showTermsModal
		},
		toggleDisclaimerModalVisibility: function () {
			this.showDisclaimerModal = !this.showDisclaimerModal
		},
		toggleFaqModalVisibility: function () {
			this.showFaqModal = !this.showFaqModal
		},
	},
})

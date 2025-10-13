<div align="center">
  <img alt="Project Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6">
  <h1 align="center">Nepal College Email Harvester</h1>
</div>

<p align="center">
  A powerful, AI-driven tool to find official email addresses of colleges in Nepal, built for efficiency and accuracy.
  <br />
  <a href="https://nepal-college-email-harvester.vercel.app/" target="_blank"><strong>View Demo »</strong></a>
  <br />
  <br />
  <a href="https://github.com/Gurkha-Technology-Open-Source/Nepal-College-Email-Harvester/issues/new?assignees=&labels=bug&template=bug_report.md&title=">Report Bug</a>
  ·
  <a href="https://github.com/Gurkha-Technology-Open-Source/Nepal-College-Email-Harvester/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=">Request Feature</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/Gurkha-Technology-Open-Source/Nepal-College-Email-Harvester?style=for-the-badge" alt="GitHub Stars">
  <img src="https://img.shields.io/github/forks/Gurkha-Technology-Open-Source/Nepal-College-Email-Harvester?style=for-the-badge" alt="GitHub Forks">
  <img src="https://img.shields.io/github/issues/Gurkha-Technology-Open-Source/Nepal-College-Email-Harvester?style=for-the-badge" alt="GitHub Issues">
  <img src="https://img.shields.io/github/license/Gurkha-Technology-Open-Source/Nepal-College-Email-Harvester?style=for-the-badge" alt="License">
</p>

---

## 🌟 About The Project

The **Nepal College Email Harvester** is a web-based application designed to simplify the process of finding official contact information for colleges across Nepal. Leveraging the power of Google's Gemini AI, this tool performs deep searches to retrieve accurate and up-to-date email addresses, saving valuable time for students, researchers, and organizations.

This project was built with the goal of creating a simple, user-friendly interface to a powerful backend, making data collection effortless. It's an open-source initiative, perfect for contributors looking to participate in **Hacktoberfest**!

This project is an open-source initiative by **Gurkha Technology** and is actively maintained by the community.

### ✨ Features

- **AI-Powered Search:** Utilizes the Gemini AI model for intelligent and accurate data retrieval.
- **Comprehensive Filtering:** Search by Province, Affiliated University, and Faculty/Program.
- **CSV Export:** Download the harvested email lists in a clean, ready-to-use CSV format.
- **Data Sources:** Displays the web sources used by the AI to find the information, ensuring transparency.
- **Responsive Design:** A clean, modern, and mobile-friendly interface built with React and Tailwind CSS.
- **Light & Dark Mode:** Adapts to your system's theme for comfortable viewing.

---

## 🛠️ Built With

This project is built with a modern and robust tech stack:

- **[React](https://reactjs.org/)** - A JavaScript library for building user interfaces.
- **[Vite](https://vitejs.dev/)** - A next-generation frontend tooling for fast development.
- **[TypeScript](https://www.typescriptlang.org/)** - A typed superset of JavaScript that compiles to plain JavaScript.
- **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework for rapid UI development.
- **[Google Gemini AI](https://ai.google.dev/)** - The powerful AI model used for data harvesting.

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.
- **Node.js** (v18 or higher recommended)
  ```sh
  https://nodejs.org/
  ```

### Installation

1. **Fork the Repository**
   Click the "Fork" button at the top right of this page to create your own copy.

2. **Clone the Fork**
   ```sh
   git clone https://github.com/YOUR_USERNAME/Nepal-College-Email-Harvester.git
   ```

3. **Navigate to the Project Directory**
   ```sh
   cd Nepal-College-Email-Harvester
   ```

4. **Install NPM packages**
   ```sh
   npm install
   ```

5. **Set up Environment Variables**
   Create a `.env` file in the root of the project and add your Gemini API key.
   ```
   VITE_GEMINI_API_KEY=YOUR_API_KEY
   ```
   You can get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Application

Once the installation is complete, run the development server:

```sh
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📖 Usage

1. **Select Filters:** Choose a Province and an Affiliated University from the dropdown menus. You can also optionally filter by Faculty/Program.
2. **Enter API Key (Optional):** If you haven't set the environment variable, you can enter your Gemini API key directly in the input field.
3. **Harvest Emails:** Click the "Harvest Emails" button to start the search.
4. **View Results:** The application will display a list of colleges matching your criteria, along with their email addresses.
5. **Download CSV:** Click the "Download CSV" button to save the results to your computer.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [**Contributing Guidelines**](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests to us. This project is a great opportunity for **Hacktoberfest** participants!

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- [Google AI](https://ai.google/) for the powerful Gemini model.
- [Vercel](https://vercel.com/) for hosting the live demo.
- All the amazing contributors who will help make this project even better!

---

## 🏢 Maintained By

This project is initiated and actively maintained by **Gurkha Technology**. We are a software development company based in Nepal, passionate about open-source and building innovative solutions.

<a href="https://gurkhatech.com/" target="_blank">
  <img src="https://gurkhatech.com/wp-content/uploads/2025/01/GT-logo-wtih-icon.svg" alt="Gurkha Technology" width="200">
</a>
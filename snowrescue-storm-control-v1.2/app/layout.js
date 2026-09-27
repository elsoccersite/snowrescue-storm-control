import "./globals.css";

export const metadata = {
  title: "SnowRescue Storm Control",
  description: "Private SnowRescue storm operations control."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

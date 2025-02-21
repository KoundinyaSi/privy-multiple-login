import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import React, { useEffect, useState, useRef } from "react";
import { PrivyProvider } from "@privy-io/react-auth";

function MyApp({ Component, pageProps }: AppProps) {
  const [capturedPhone, setCapturedPhone] = useState("");
  const [capturedCountry, setCapturedCountry] = useState("1");

  // We'll use refs to hold references to the elements.
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const countrySelectRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    let phoneListenerAttached = false;
    let selectListenerAttached = false;

    // Handler for phone input changes.
    const handlePhoneInput = (event: Event) => {
      const inputEl = event.target as HTMLInputElement;
      const currentValue = inputEl.value;
      // Use setTimeout(…,0) to update asynchronously so we don't interfere with Privy's UI.
      setTimeout(() => {
        setCapturedPhone(currentValue);
        console.log("Captured phone:", currentValue);
      }, 0);
    };

    // Handler for select changes.
    const handleCountryChange = (event: Event) => {
      const selectEl = event.target as HTMLSelectElement;
      if (!selectEl) return;
      let selectedCOde = selectEl.selectedOptions.item(0)?.innerText.split('+')[1];
      // console.log("Country code select changed:", selectedCOde);
      if (selectedCOde) {
        setTimeout(() => {
          setCapturedCountry(selectedCOde);
          console.log("Captured country code text:", selectedCOde);
        }, 0);
      }
    };

    // Create an observer that watches for DOM changes.
    const observer = new MutationObserver(() => {
      // Check for the phone input.
      if (!phoneListenerAttached) {
        const phoneInput = document.getElementById("phone-number-input") as HTMLInputElement | null;
        if (phoneInput) {
          // Save reference and attach event listener.
          phoneInputRef.current = phoneInput;
          phoneInput.removeEventListener("input", handlePhoneInput);
          phoneInput.addEventListener("input", handlePhoneInput);
          phoneListenerAttached = true;
          console.log("Phone input listener attached.");
        }
      }

      // Once phone input is found, check for the adjacent select.
      if (phoneListenerAttached && !selectListenerAttached) {
        // Option 1: Use the adjacent sibling selector.
        const selectEl = document.querySelector("select") as HTMLSelectElement | null;
        console.log("Adjacent sibling select:*******************************8", selectEl);
        if (selectEl && selectEl.tagName === "SELECT") {
          countrySelectRef.current = selectEl;
          selectEl.removeEventListener("change", handleCountryChange);
          selectEl.addEventListener("change", handleCountryChange);
          selectListenerAttached = true;
          console.log("Country code select listener attached.");
        }
      }
    });

    // Observe changes in the whole document.
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup on unmount.
    return () => {
      observer.disconnect();
      if (phoneInputRef.current) {
        phoneInputRef.current.removeEventListener("input", handlePhoneInput);
      }
      if (countrySelectRef.current) {
        countrySelectRef.current.removeEventListener("change", handleCountryChange);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Privy Auth Starter</title>
        <meta name="description" content="Privy Auth Starter" />
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff2" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff2" as="font" crossOrigin="" />
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/manifest.json" />
      </Head>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        config={{
          embeddedWallets: {
            createOnLogin: "all-users",
          },
          // Other Privy config options as needed.
          loginMethods: ['google', 'wallet', 'sms' ],
        }}
      >
        <Component {...pageProps} />
        {/* Display the captured phone number and country code */}
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc" }}>
          <h3>Captured Values:</h3>
          <p>
            <strong>Phone:</strong> {capturedPhone || "Not entered yet."}
          </p>
          <p>
            <strong>Country Code:</strong> {capturedCountry}
          </p>
        </div>
      </PrivyProvider>
    </>
  );
}

export default MyApp;

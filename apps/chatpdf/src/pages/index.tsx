import type { NextPage } from "next";
import Head from "next/head";
import { useLocalization } from "../hooks/useLocalization";
import dynamic from "next/dynamic";
import LeftSide from "../components/LeftSide";
import MiddleSide from "../components/MiddleSide";
import { AppContext } from "../context";
import { useContext } from "react";
import NavBar from "../components/NavBar";

const ChatUiWindow = dynamic(
  () => import("../components/ChatWindow/ChatUiWindow"),
  { ssr: false }
);

const Home: NextPage = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const { collapsed } = context;

  return (
    <>
      <Head>
        <title> {t("label.title")}</title>
      </Head>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
        }}
      >
        <div
          style={{
            backgroundColor: "#b99825",
            flex: collapsed ? "0.05" : "0",
            color: "white",
            padding: "1vh",
            transition: "all 0.2s ease",
            display: "none",
          }}
        >
          <LeftSide />
        </div>
        <div
          style={{
            backgroundColor: "#0B1F3A",
            flex: 1,
          }}
        >
          <MiddleSide />
        </div>
        <div
          style={{
            flex: 0.7,
            height: "100vh",
          }}
        >
          <NavBar />
          <div
            id="chatUI"
            style={{
              position: "fixed",
              top: "90px",
              bottom: "1vh",
              width: "41vw",
            }}
          >
            <ChatUiWindow />
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <style jsx>{`
        @media (max-width: 767px) {
          #chatUI {
            width: 100% !important;
          }
          div {
            display: none;
          }
          div:last-child {
            display: block;
          }
        }
      `}</style>
    </>
  );
};
export default Home;

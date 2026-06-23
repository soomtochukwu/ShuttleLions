"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComicButton } from "@/components/ui/ComicButton";
import { ComicInput } from "@/components/ui/ComicInput";
import { ComicProgress } from "@/components/ui/ComicProgress";
import { FloatingHearts } from "@/components/FloatingHearts";
import { springIn, slideUp, staggerContainer } from "@/lib/animations";
import { useAuth } from "@/components/AuthContext";
import { audio } from "@/lib/audio";

type Step = "auth" | "input" | "generating" | "share";

export default function HomePage() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [step, setStep] = useState<Step>("auth");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [crushHandle, setCrushHandle] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [linkId, setLinkId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const STORAGE_KEY = "rizz14_state";

  // Automatically move to input step when authenticated
  // Modified to respect restored state if it exists
  if (isAuthenticated && step === "auth" && !isLoading) {
    // Only auto-advance if we don't have a stored step that is further ahead
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!saved) {
      setStep("input");
    }
  }

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.crushHandle) setCrushHandle(parsed.crushHandle);
        if (parsed.whatsApp) setWhatsApp(parsed.whatsApp);
        if (parsed.aiMessage) setAiMessage(parsed.aiMessage);
        if (parsed.linkId) setLinkId(parsed.linkId);
        // Restore step last to ensure data is ready
        if (parsed.step && parsed.step !== "auth") {
          setStep(parsed.step);
        }
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (step === "auth") return; // Don't save empty auth state
    const state = {
      step,
      crushHandle,
      whatsApp,
      aiMessage,
      linkId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [step, crushHandle, whatsApp, aiMessage, linkId]);

  const stepIndex = step === "auth" ? 0 : step === "input" ? 0 : step === "generating" ? 1 : 2;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!crushHandle.trim()) errs.crushHandle = "Who's the lucky one?";
    if (!whatsApp.trim()) errs.whatsApp = "How will they reach you?";
    else if (!/^\+?\d{7,15}$/.test(whatsApp.replace(/\s/g, "")))
      errs.whatsApp = "Enter a valid phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStep("generating");
    await generateMessage();
  };

  const generateMessage = async () => {
    try {
      audio.play("processing");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crushHandle: crushHandle.replace(/^@/, ""),
          senderWhatsApp: whatsApp,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Something went wrong");
      }

      const data = await res.json();
      setAiMessage(data.aiMessage);
      setLinkId(data.linkId);
      audio.play("success");
      setStep("share");
    } catch (err: any) {
      audio.play("error");
      setErrors({ form: err.message || "Something went wrong. Try again!" });
      if (step === "generating") setStep("input");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerate = async () => {
    audio.play("click");
    setIsRegenerating(true);
    await generateMessage();
  };

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${linkId}`;
    }
    return `/${linkId}`;
  };

  const shareOnX = () => {
    audio.play("pop");
    const handle = crushHandle.startsWith("@") ? crushHandle : `@${crushHandle}`;
    const text = encodeURIComponent(
      `${handle} ${aiMessage}\n\n💘 Will you say yes? 👉 ${getShareUrl()}\n\n(powered by @rizz_14th)`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    audio.play("pop");
    const text = encodeURIComponent(
      `Someone has a crush on you! 💘 Open this link to find out: ${getShareUrl()}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const copyLink = async () => {
    audio.play("click");
    await navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    audio.play("click");
    localStorage.removeItem(STORAGE_KEY);
    await logout();
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-4 relative w-full min-h-full">
      <FloatingHearts />

      <div className="w-full max-w-lg z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-4 sm:mb-8"
          variants={springIn}
          initial="hidden"
          animate="visible"
        >
          <h1
            className="text-4xl sm:text-7xl mb-1 sm:mb-2 text-stroke"
            style={{
              fontFamily: "Bangers, cursive",
              color: "var(--hot-pink)",
              textShadow: "3px 3px 0 #000",
            }}
          >
            RIZZ-14TH
          </h1>
          <p
            className="text-base sm:text-xl"
            style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}
          >
            Nothing serious, its just for fun! 💘
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="mb-3 sm:mb-6"
          variants={slideUp}
          initial="hidden"
          animate="visible"
        >
          <ComicProgress
            currentStep={stepIndex}
            totalSteps={3}
            labels={["Details", "AI Magic", "Share!"]}
          />
        </motion.div>

        {/* Main Panel */}
        <AnimatePresence mode="wait">
          {/* Step 0: Auth */}
          {step === "auth" && !isLoading && (
            <motion.div
              key="auth"
              className="comic-panel p-4 sm:p-8 text-center"
              variants={springIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mb-4 inline-block"
              >
                <svg viewBox="0 0 24 24" className="w-14 h-14 sm:w-16 sm:h-16" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.div>
              <h2
                className="text-xl sm:text-2xl mb-2"
                style={{ fontFamily: "Bangers, cursive" }}
              >
                SIGN IN TO SHOOT YOUR SHOT
              </h2>
              {/* <p
                className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6"
                style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}
              >
                We&apos;ll auto-post your rizz to X and tag your crush 🎯
              </p> */}
              <ComicButton
                variant="dark"
                onClick={() => { audio.play("click"); login(); }}
                size="lg"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block mr-1 fill-current" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> SIGN IN WITH X
              </ComicButton>
              {/* <p className="mt-3 text-[10px] text-gray-400" style={{ fontFamily: "Inter, sans-serif" }}>
                We&apos;ll ask permission to post &amp; like tweets on your behalf
              </p> */}
            </motion.div>
          )}

          {/* Step 1: Input */}
          {step === "input" && (
            <motion.div
              key="input"
              className="comic-panel p-4 sm:p-8"
              variants={springIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Signed-in user badge */}
              {user && (
                <div className="flex items-center gap-2 mb-3 sm:mb-4 p-2 bg-green-50 border-2 border-black rounded-lg">
                  {user.x_avatar_url && (
                    <img
                      src={user.x_avatar_url}
                      alt={user.x_handle}
                      className="w-8 h-8 rounded-full border-2 border-black"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ fontFamily: "Inter, sans-serif" }}>
                      @{user.x_handle}
                    </p>
                    <p className="text-[10px] text-green-600">✓ Signed in</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-[10px] text-gray-400 hover:text-gray-600 underline"
                  >
                    Sign out
                  </button>
                </div>
              )}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                autoComplete="on"
                noValidate
              >
                <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                  <motion.div variants={slideUp} className="mb-3 sm:mb-6">
                    <h2
                      className="text-xl sm:text-2xl mb-1"
                      style={{ fontFamily: "Bangers, cursive" }}
                    >
                      👀 WHO&apos;S THE LUCKY ONE?
                    </h2>
                    <p
                      className="text-xs sm:text-sm text-gray-600"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      We&apos;ll craft the perfect message for you
                    </p>
                  </motion.div>

                  <motion.div variants={slideUp} className="mb-3 sm:mb-4">
                    <ComicInput
                      label="Their X (Twitter) Username"
                      icon="𝕏"
                      placeholder="@crush_handle"
                      value={crushHandle}
                      onChange={(e) => setCrushHandle(e.target.value)}
                      error={errors.crushHandle}
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      type="text"
                    />
                  </motion.div>

                  <motion.div variants={slideUp} className="mb-4 sm:mb-6">
                    <ComicInput
                      label="Your WhatsApp Number"
                      icon="📱"
                      placeholder="+234 XXX XXX XXXX"
                      value={whatsApp}
                      onChange={(e) => {
                        const filtered = e.target.value.replace(/[^\d+\s\-()]/g, "");
                        setWhatsApp(filtered);
                      }}
                      pattern="[\d\s+\-()]*"
                      error={errors.whatsApp}
                      inputMode="tel"
                      autoComplete="tel"
                      type="tel"
                    />
                  </motion.div>

                  {errors.form && (
                    <p className="text-red-600 text-xs sm:text-sm mb-3 sm:mb-4 font-bold text-center">
                      ⚠️ {errors.form}
                    </p>
                  )}

                  <motion.div variants={slideUp}>
                    <ComicButton
                      variant="pink"
                      onClick={() => audio.play("click")}
                      type="submit"
                      className="w-full"
                      size="lg"
                    >
                      💘 SHOOT YOUR SHOT!
                    </ComicButton>
                  </motion.div>
                </motion.div>
              </form>
            </motion.div>
          )}

          {/* Step 2: Generating */}
          {step === "generating" && (
            <motion.div
              key="generating"
              className="comic-panel p-8 text-center"
              variants={springIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1, 1.2, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                💘
              </motion.div>
              <h2
                className="text-2xl mb-2"
                style={{ fontFamily: "Bangers, cursive" }}
              >
                CRAFTING THE PERFECT LINE...
              </h2>
              <p
                className="text-gray-600"
                style={{ fontFamily: "Comic Neue, cursive" }}
              >
                Our AI wingman is cooking up something special 🍳
              </p>
              <div className="mt-6">
                <button
                  onClick={() => { audio.play("click"); setStep("input"); }}
                  className="text-sm underline text-gray-500 hover:text-gray-800"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Wait, go back!
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Share */}
          {step === "share" && (
            <motion.div
              key="share"
              className="comic-panel p-6 sm:p-8"
              variants={springIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h2
                className="text-2xl mb-4 text-center"
                style={{ fontFamily: "Bangers, cursive" }}
              >
                🎉 YOUR LINK IS READY!
              </h2>

              {/* AI Message Preview */}
              <div className="relative">
                <div className="speech-bubble mb-8 pr-12">
                  <p>{isRegenerating ? "Cooking up a new line... 🍳" : aiMessage}</p>
                </div>
                {!isRegenerating && (
                  <button
                    onClick={handleRegenerate}
                    className="absolute -top-2 -right-2 bg-yellow-400 border-2 border-black p-2 rounded-full hover:scale-110 transition-transform shadow-[3px_3px_0_#000]"
                    title="Generate new Rizz"
                  >
                    🔄
                  </button>
                )}
              </div>

              {/* Link Display */}
              <div className="bg-gray-100 border-2 border-black p-3 mb-6 flex items-center gap-2">
                <span
                  className="flex-1 text-sm truncate font-mono"
                  style={{ fontFamily: "monospace" }}
                >
                  {getShareUrl()}
                </span>
                <button
                  onClick={copyLink}
                  className="text-sm font-bold px-3 py-1 border-2 border-black bg-yellow-300 hover:bg-yellow-400 whitespace-nowrap"
                >
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>

              {/* Share Buttons */}
              <div className="space-y-3">
                <ComicButton
                  variant="dark"
                  onClick={shareOnX}
                  className="w-full"
                >
                  𝕏 SHARE ON X (Twitter)
                </ComicButton>

                <ComicButton
                  variant="pink"
                  onClick={shareOnWhatsApp}
                  className="w-full"
                >
                  📱 SHARE ON WHATSAPP
                </ComicButton>

                <ComicButton
                  variant="yellow"
                  onClick={copyLink}
                  className="w-full"
                >
                  🔗 {copied ? "LINK COPIED!" : "COPY LINK"}
                </ComicButton>
              </div>

              {/* Social Proof */}
              <motion.p
                className="text-center text-sm text-gray-500 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{ fontFamily: "Comic Neue, cursive" }}
              >
                💘 47 people have already confessed today. Your turn!
              </motion.p>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { audio.play("click"); setStep("input"); }}
                  className="text-sm underline text-gray-500 hover:text-gray-800"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  ✏️ Edit / Try Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          className="text-center text-xs mt-6 opacity-60"
          style={{ fontFamily: "Inter, sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5 }}
        >
          Made with 💘 and a little bit of rizz
        </motion.p>
      </div>
    </div>
  );
}

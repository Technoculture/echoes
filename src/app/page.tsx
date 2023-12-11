"use client";

import { useEffect } from "react";
import { Header } from "@/components/header";
import { Button, buttonVariants } from "@/components/button";
import Link from "next/link";
import { Widget } from "@typeform/embed-react";
import Image from "next/image";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Key, LayoutDashboard } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const handleSmoothScroll = (): void => {
  if (typeof window !== "undefined") {
    const hashId = window.location.hash;

    console.log({ location: window.location, hashId });

    if (hashId) {
      const element = document.querySelector(hashId);
      console.log({ element });

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }
  }
};

const footerAnimationStates = {
  visible: { opacity: 1, y: 0, transition: { duration: 1 } },
  hidden: { opacity: 0, y: -50 },
};

export default function Home() {
  const controls = useAnimation();
  const [ref, inView] = useInView();
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  const { isSignedIn } = useAuth();

  return (
    <div>
      <AnimatePresence onExitComplete={handleSmoothScroll}>
        <div className="h-screen relative">
          <Header className="bg-black/40 backdrop-blur-md">
            <Button
              className="mr-4 h-[32px]"
              variant="secondary"
              asChild
            ></Button>
          </Header>
          <div className="absolute top-0 w-full y-0 flex flex-col flex-grow h-screen justify-center items-center gap-2 text-center">
            <div className="absolute inset-0 -z-5">
              <Image
                src="/isometric.png"
                alt="image of echoes being used"
                className="w-full h-full object-cover mix-blend-soft-light"
                fill={true}
                quality={5}
              />
            </div>
            <div className="z-10">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Hello Innovator,
              </h1>
              <h1 className="text-2xl text-popover-foreground flex-wrap w-72 text-center">
                Let's hyper-accelerate your research.
              </h1>
              <div className="grid md:grid-col-2 gap-4 sm:grid-col-1 p-4">
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: "default" })}
                >
                  <LayoutDashboard className="mr-2 w-4 h-4" />
                  Dashboard
                </Link>
                {isSignedIn || (
                  <Link
                    className={buttonVariants({ variant: "secondary" })}
                    href="/#requestaccess"
                  >
                    <Key className="mr-2 w-4 h-4" />
                    Request Access
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatePresence>

      {isSignedIn || (
        <AnimatePresence onExitComplete={handleSmoothScroll}>
          <div
            className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-slate-950 via-black to-black -z-20"
            id="requestaccess"
          >
            <Widget id="H4H0D2hi" className="w-min-72 w-3/4 h-3/4 -z-2" />
          </div>
        </AnimatePresence>
      )}

      <div className="md:p-20 p-12 bg-slate-950 border border-t-1 border-slate-900">
        <motion.div
          ref={ref}
          animate={controls}
          initial="hidden"
          variants={footerAnimationStates}
          className="grid md:grid-cols-3 sm:grid-cols-1 gap-4 sm:gap-8"
        >
          <div className="p-4 flex flex-col space-y-4">
            <h1 className="font-bold mb-4">Trusted By Innovators</h1>
            <Link
              href="https://technoculture.io"
              className="text-sm text-popover-foreground"
            >
              Technoculture, Inc.
            </Link>
            <Link
              href="https://exrna.com"
              className="text-sm text-popover-foreground"
            >
              ExRNA Therapeutics
            </Link>
            <Link
              href="https://vvbiotech.com"
              className="text-sm text-popover-foreground"
            >
              VV Biotech
            </Link>
          </div>

          <div className="p-4 flex flex-col space-y-4">
            <h1 className="font-bold mb-4">Built With</h1>
            <Link
              href="https://openai.com/"
              className="text-sm text-popover-foreground"
            >
              OpenAI
            </Link>
            <Link
              href="https://anyscale.com/"
              className="text-sm text-popover-foreground"
            >
              Anyscale
            </Link>
            <Link
              href="https://search.projectpq.ai/"
              className="text-sm text-popover-foreground"
            >
              pqai
            </Link>
          </div>
          <div className="p-4 flex flex-col space-y-2">
            <h1 className="font-bold mb-4">Integrations</h1>
            <Link
              href="https://openoligo.com/"
              className="text-sm text-popover-foreground"
            >
              OpenOligo
            </Link>
          </div>
          <div className="p-4 col-span-1 md:col-span-3 justify-end">
            <hr className="mb-8 border-slate-900" />
            <div className="flex justify-between">
              <h1 className="text-sm text-popover-foreground">
                © 2023 Technoculture Research
              </h1>
              <h1 className="text-xl text-popover-foreground">🇮🇳</h1>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

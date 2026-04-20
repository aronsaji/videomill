import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";



export default function authcallback() {

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const [message, setMessage] = useState("Kobler til YouTube...");



  useEffect(() => {

    const handleCallback = async () => {

      const code = searchParams.get("code");

      const userId = searchParams.get("state"); // Vi sendte user.id som state



      if (!code || !userId) {

        setStatus("error");

        setMessage("Manglet nødvendig informasjon fra Google.");

        return;

      }



      try {

        // HER sender vi dataen til din n8n Webhook

        // Erstatt URL-en under med din n8n "Production Webhook URL"

        const N8N_WEBHOOK_URL = "https://din-n8n-instans.com/webhook/youtube-auth";



        const response = await fetch(N8N_WEBHOOK_URL, {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            code: code,

            userId: userId,

            platform: "youtube",

            redirectUri: window.location.origin + "/auth/callback/youtube"

          }),

        });



        if (response.ok) {

          setStatus("success");

          setMessage("YouTube-kontoen er nå koblet til!");

          // Send brukeren tilbake til settings etter 2 sekunder

          setTimeout(() => navigate("/settings"), 2000);

        } else {

          throw new Error("n8n klarte ikke å prosessere forespørselen.");

        }

      } catch (error) {

        console.error("Auth Error:", error);

        setStatus("error");

        setMessage("Noe gikk galt under lagring av tilgangen.");

      }

    };



    handleCallback();

  }, [searchParams, navigate]);



  return (

    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">

      <div className="max-w-md w-full bg-zinc-900/50 border border-white/10 p-8 rounded-3xl text-center space-y-6">

        

        {status === "loading" && (

          <div className="flex flex-col items-center space-y-4">

            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />

            <h2 className="text-xl font-bold uppercase tracking-tight italic">

              System_<span className="text-amber-500">Syncing</span>

            </h2>

            <p className="text-zinc-400 text-sm font-mono uppercase">{message}</p>

          </div>

        )}



        {status === "success" && (

          <div className="flex flex-col items-center space-y-4">

            <CheckCircle2 className="w-12 h-12 text-green-500" />

            <h2 className="text-xl font-bold uppercase tracking-tight italic text-green-500">

              Access_<span className="text-white">Granted</span>

            </h2>

            <p className="text-zinc-400 text-sm font-mono uppercase">{message}</p>

          </div>

        )}



        {status === "error" && (

          <div className="flex flex-col items-center space-y-4">

            <AlertCircle className="w-12 h-12 text-red-500" />

            <h2 className="text-xl font-bold uppercase tracking-tight italic text-red-500">

              System_<span className="text-white">Error</span>

            </h2>

            <p className="text-zinc-400 text-sm font-mono uppercase">{message}</p>

            <button 

              onClick={() => navigate("/settings")}

              className="mt-4 text-xs bg-white text-black px-4 py-2 rounded-lg font-black uppercase tracking-widest"

            >

              Gå tilbake

            </button>

          </div>

        )}



      </div>

    </div>

  );

}


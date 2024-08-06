import React, { FormEvent, Fragment, useState, useEffect, useRef, useContext } from 'react';

// IMPORTED PACKAGES
import { AiFillPhone } from 'react-icons/ai';
import { BiSend } from 'react-icons/bi';

// IMPORTED COMPONENTS
import MsgDisplay from './MsgDisplay';
import { useRouter } from 'next/router';
import styles from '../styles/RightSide.module.css';
import { Centrifuge, Subscription } from "centrifuge";
import { DataContext } from '@/store/GlobalState';
import { FaAlignJustify } from 'react-icons/fa';

interface Message {
  user: string;
  message: string;
}

const RightSide = ({showNav, setShowNav}) => {
  const router = useRouter()
  const refDisplay = useRef(null);
  const pageEnd = useRef(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const { slug } = router.query;
  const [centrifuge, setCentrifuge] = useState<Centrifuge | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const {state} = useContext(DataContext)
  const [user, setUser] = useState(null)


  // get login user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    setUser(user?.username)
  }, [])
  

  useEffect(() => {
    if (slug){
      // Initialize Centrifuge client
      const centrifugeClient: any = new Centrifuge(
        "wss://deployment.api-golang.boilerplate.hng.tech/centrifugo/connection/websocket",
        {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM3MjIiLCJleHAiOjE3MjM0ODU2NTgsImlhdCI6MTcyMjg4MDg1OH0.BX4gDceZoFYCq0FTOoqc2jGp_5pS41uz_-9QMqMWbDk",
            // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM3MjIiLCJleHAiOjE3MjM0MjY2NzIsImlhdCI6MTcyMjgyMTg3Mn0.zhB3jD1MWGWd0dCTRLOoJvTrhgS3imTbYSUy9--xK8M",
        },
      );

      setCentrifuge(centrifugeClient);

      centrifugeClient.on("connect", () => {
        setConnected(true);
        console.log("Connected to Centrifuge");
      });

      centrifugeClient.on("disconnect", () => {
        setConnected(false);
        console.log("Disconnected from Centrifuge");
      });

      // Create a subscription to the channel
      const sub = centrifugeClient.newSubscription(`room#${slug}`);

      sub.on("publication", (ctx: any) => {
        setMessages((prev) => [...prev, ctx.data]);
      });

      sub.on("subscribed", () => {
        console.log(`Subscribed to room#${slug}`);
      });

      sub.on("unsubscribed", () => {
        console.log(`Unsubscribed from room#${slug}`);
      });

      sub.on("error", (ctx: any) => {
        console.error(`Subscription error: ${ctx.message}`);
      });

      // Connect to Centrifuge and subscribe
      centrifugeClient.connect();
      sub.subscribe();

      // Set subscription state
      setSubscription(sub);

      // Cleanup on component unmount
      return () => {
        sub.unsubscribe();
        centrifugeClient.disconnect();
      };
    }


  }, [slug]);


  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && centrifuge) {
      subscription?.publish({ user:state?.user, message }).catch((error) => {
        console.error("Publish error:", error.message);
      });
      setMessage("");
    }
  };

// 

  return (
    <Fragment>

      <div className={styles.message_header}>
        <div className="d-flex align-items-center gap-3">
          <FaAlignJustify className={styles.icons}  onClick={() => setShowNav(!showNav)}/>
          <p className="mb-0">{state?.user}</p>
        </div>
      </div>

      <div
        className={styles.chat_container}
      >
        <div className={styles.chat_display} ref={refDisplay}>
          <button ref={pageEnd}>Load more</button>

          {messages?.map((msg, index) => (
            <div key={index}>
              {msg?.user !== user && <div className={`${styles.chat_row} ${styles.other_message}`}>
                  <MsgDisplay msg={msg}/>
                </div>}

                {msg?.user === user && <div className={`${styles.chat_row} ${styles.you_message}`}>
                  <MsgDisplay msg={msg}/>
                </div>}

            </div>
          ))}

        </div>
      </div>

      {/* THE SUBMIT SECTION */}
      <form className={styles.chat_input} onSubmit={sendMessage}>
        <div className={styles.form_group}>
          <input type="text"
            placeholder='Enter your message...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className={styles.form_input}>
          <button
            disabled={message ? false : true}
          >
            <BiSend className={styles.icons} />
          </button>
        </div>
      </form>
    </Fragment>
  );
};

export default RightSide;

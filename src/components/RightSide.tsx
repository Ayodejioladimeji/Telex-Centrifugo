import React, { FormEvent, Fragment, useState, useCallback, useEffect, useRef, useContext } from 'react';
import axios from 'axios';

// IMPORTED PACKAGES
import { AiFillPhone } from 'react-icons/ai';
import { BiSend } from 'react-icons/bi';
import cogoToast from "cogo-toast";

// IMPORTED COMPONENTS
import MsgDisplay from './MsgDisplay';
import { useRouter } from 'next/router';
import styles from '../styles/RightSide.module.css';
import { Centrifuge, Subscription } from "centrifuge";
import { DataContext } from '@/store/GlobalState';
import { FaAlignJustify } from 'react-icons/fa';
import { type } from 'os';


interface Message {
  username: string;
  content: string;
}

const RightSide = ({ showNav, setShowNav }) => {
  const router = useRouter()
  const refDisplay = useRef(null);
  const pageEnd = useRef(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const { slug } = router.query;
  const [centrifuge, setCentrifuge] = useState<Centrifuge | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { state } = useContext(DataContext)
  const [user, setUser] = useState(null)


  // get login user
  useEffect(() => {
    const user = localStorage.getItem("user");
    console.log(user);
    setUser(JSON.parse(user))
  }, [])

  const getConnectionToken = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    const response = await axios.get(`https://api-golang.boilerplate.hng.tech/api/v1/token/connection/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    console.log(response.data.data.token);
    console.log(typeof (response?.data?.data?.token))
    const token = response?.data?.data?.token
    return response?.data?.data?.token
    // return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjMwNTQ1MDgsImlhdCI6MTcyMzA1NDIwOCwic3ViIjoiMDE5MTJkMDEtMGQ3YS03YTNmLWEzY2ItNDNiMzhjYTkxMzA2In0.U0nbwJYgWWcK8fL78ef_zFqAS5cvIF6aB_Rivexf7lo"
  }, [])

  const getSubscriptionToken = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    const response = await axios.post(`https://api-golang.boilerplate.hng.tech/api/v1/token/subscription/`, {
      channel: slug
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    // console.log(response.data.data.token);
    return response.data.data.token;
  }, [slug])


  useEffect(() => {
    if (slug) {
      const fetchMessages = async () => {
        try {
          const accessToken = localStorage.getItem('access_token');
          const response = await axios.get(`https://api-golang.boilerplate.hng.tech/api/v1/rooms/${slug}/messages`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          setMessages(response.data.data);
        } catch (error) {
          cogoToast.error(error.message)
        }
      }

      const joinRoom = async () => {
        try {
          const accessToken = localStorage.getItem('access_token');
          const response = await axios.post(`https://api-golang.boilerplate.hng.tech/api/v1/rooms/${slug}/join`, { "username": user?.username }, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
        } catch (error) {
          console.log(error)
          cogoToast.error(error.message)
        }
      }

      joinRoom();
      fetchMessages();

      const centrifugeClient: any = new Centrifuge(
        "wss://api-golang.boilerplate.hng.tech/centrifugo/connection/websocket",
        {
          getToken: getConnectionToken,
          // debug: true,
          // token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjMwNTMzODAsInN1YiI6IjAxOTEyZDAxLTBkN2EtN2EzZi1hM2NiLTQzYjM4Y2E5MTMwNiJ9.Mr74BXAzcM_XeBlspGvsYVes2_y_V9P2EDPZCYJMEbE"
          // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM3MjIiLCJleHAiOjE3MjM0MjY2NzIsImlhdCI6MTcyMjgyMTg3Mn0.zhB3jD1MWGWd0dCTRLOoJvTrhgS3imTbYSUy9--xK8M",
        },
      );

      console.log("before connection", centrifugeClient)

      setCentrifuge(centrifugeClient);
      console.log(centrifugeClient)

      centrifugeClient.on("connect", () => {
        setConnected(true);
        console.log(connected)
        console.log("Connected to Centrifuge");
      });

      centrifugeClient.on("disconnect", () => {
        setConnected(false);
        console.log("Disconnected from Centrifuge");
      });

      // Create a subscription to the channel
      const sub = centrifugeClient.newSubscription(slug, {
        getToken: getSubscriptionToken,
        debug: true
      });

      sub.on("publication", (ctx: any) => {
        setMessages((prev) => [...prev, ctx.data]);
        console.log("publication", ctx.data)
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

      console.log("after connection", centrifugeClient)

      // Set subscription state
      setSubscription(sub);

      console.log("subscription state", subscription)

      // Cleanup on component unmount
      return () => {
        sub.unsubscribe();
        centrifugeClient.disconnect();
      };
    }


  }, [slug, connected, getSubscriptionToken, getConnectionToken, subscription, user?.username]);


  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && centrifuge) {
      try {
        // Publish message to Centrifuge
        await subscription?.publish({ username: user?.username, content: message });
        const updatedList = [...messages, { username: user?.username, content: message }];
        setMessages(updatedList);
        console.log(messages)
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.post(
          `https://api-golang.boilerplate.hng.tech/api/v1/rooms/${slug}/messages`,
          {
            content: message
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setMessage("");
        cogoToast.success("Message sent successfully.");
        console.log(response)
      } catch (error) {
        cogoToast.error("Failed to send message.");
        console.log("error sending message", error)
      } finally {
      }
    } else {
      cogoToast.error("Message cannot be empty.");
    }
  };

  // 

  return (
    <Fragment>
      <div className={styles.message_header}>
        <div className="d-flex align-items-center gap-3">
          <FaAlignJustify className={styles.icons} onClick={() => setShowNav(!showNav)} />
          <p className="mb-0">{user?.username}</p>
          <p className="mb-0">{state?.route}</p>
        </div>
      </div>

      <div
        className={styles.chat_container}
      >
        <div className={styles.chat_display} ref={refDisplay}>
          <button ref={pageEnd}>Load more</button>

          {messages?.map((msg, index) => (
            <div key={index}>
              {msg?.username !== user?.username && <div className={`${styles.chat_row} ${styles.other_message}`}>
                <MsgDisplay msg={msg} />
              </div>}

              {msg?.username === user?.username && <div className={`${styles.chat_row} ${styles.you_message}`}>
                <MsgDisplay msg={msg} />
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

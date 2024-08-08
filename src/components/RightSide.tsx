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
import { Centrifuge, Subscription, SubscriptionStateContext, SubscribedContext, SubscriptionState } from "centrifuge";
import { DataContext } from '@/store/GlobalState';
import { FaAlignJustify } from 'react-icons/fa';
import { ACTIONS } from '@/store/Actions';


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
  const { state, dispatch } = useContext(DataContext)
  const [user, setUser] = useState(null)
  const [roomName, setRoomName] = useState("")
  const [realTimeStatus, setRealTimeStatus] = useState("")
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const centrifugeUrl = process.env.NEXT_PUBLIC_CENTRIFUGE_URL;


  // get login user
  useEffect(() => {
    const user = localStorage.getItem("user");
    setUser(JSON.parse(user));
  }, [])

  const getConnectionToken = async () => {
    const accessToken = localStorage.getItem('access_token');
    const response = await axios.get(`${apiUrl}/token/connection/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    return response?.data?.data?.token
  }

    const SetStatus = async (id: string | string[]) => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get(`${apiUrl}/rooms/${id}/user-exist`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
      } catch (error) {
        cogoToast.error(error.message)
      }
    }

  const getSubscriptionToken = async () => {
    const accessToken = localStorage.getItem('access_token');
    const response = await axios.post(`${apiUrl}/token/subscription/`, {
      channel: slug
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data.data.token;
  }


  useEffect(() => {
    if (slug) {
      const fetchMessages = async () => {
        try {
          const accessToken = localStorage.getItem('access_token');
          const response = await axios.get(`${apiUrl}/rooms/${slug}/messages`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          const reversedMessages = response.data.data.reverse();
          setMessages(reversedMessages);
        } catch (error) {
          cogoToast.error(error.message)
        }
      }

      const checkUser = async () => {
        try {
          const accessToken = localStorage.getItem('access_token');
          const response = await axios.get(`${apiUrl}/rooms/${slug}/user-exist`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          if (!response.data.data.exist) {
            joinRoom();
          }
          SetStatus(slug);
        } catch (error) {
          cogoToast.error(error.message)
        }
      }

      const joinRoom = async () => {
        try {
          const accessToken = localStorage.getItem('access_token');
          const response = await axios.post(`${apiUrl}/rooms/${slug}/join`, { "username": user?.username }, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          SetStatus(slug);
        } catch (error) {
          console.log(error)
          cogoToast.error(error.message)
        }
      }
      checkUser();
      fetchMessages();
      setRoomName(state?.route);
      SetStatus(slug);


      const centrifugeClient: any = new Centrifuge(
        `${centrifugeUrl}`,
        {
          getToken: getConnectionToken,
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

      sub.on('state', (ctx: SubscriptionStateContext) => {
        if (ctx.newState == SubscriptionState.Subscribed) {
          setRealTimeStatus('🟢')
        } else {
          setRealTimeStatus('🔴')
        }
      })

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


  }, [slug]);


  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && centrifuge) {
      
      try {
        // Publish message to Centrifuge
        const now = new Date();
        const utcString = now.toISOString();
        await subscription?.publish({ username: user?.username, content: message, created_at: utcString });
        const updatedList = [...messages, { username: user?.username, content: message, created_at: utcString }];
        setMessages(updatedList);
        console.log(messages)
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.post(
          `${apiUrl}/rooms/${slug}/messages`,
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

  return (
    <Fragment>
      <div className={styles.message_header}>
        <div className={styles.message_header}>
          <div className={styles.header_content}>
            <FaAlignJustify className={styles.icons} onClick={() => setShowNav(!showNav)} />
            <h2 className={styles.room_name}>{roomName}</h2>
            <p>{realTimeStatus}</p>
          </div>
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

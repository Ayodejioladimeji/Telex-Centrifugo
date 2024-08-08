import React, { useState, useEffect } from 'react';
import styles from '../styles/RightSide.module.css';
import { format } from 'date-fns';

const MsgDisplay = ({ msg}) => {

  // 2024-08-08T06:09:48.846401Z
  // 2024-08-08T09:07:21.584Z

  const formatTime = (timestamp: string) => {
    console.log(timestamp)
    return format(new Date(timestamp), 'h:mm a');
  };

  return (
    <>
      <div className={styles.you_content}>
        <div>
          {msg.content && (
            <div className={styles.chat_text}>
              <small className={styles.time}>{msg.username}</small>
              {msg.content}
              {/* <small className={styles.chat_time}>{formatTime(msg.created_at)}</small> */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MsgDisplay;

import React, { useState, useEffect } from 'react';
import styles from '../styles/RightSide.module.css';

const MsgDisplay = ({ msg}) => {

  return (
    <>
      <div className={styles.you_content}>
        <div>
          {msg.content && (
            <div className={styles.chat_text}>
              <small className={styles.time}>{msg.username}</small>
              {msg.content}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MsgDisplay;

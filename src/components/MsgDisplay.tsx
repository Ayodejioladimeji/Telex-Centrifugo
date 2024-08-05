import React, { useState, useEffect } from 'react';
import styles from '../styles/RightSide.module.css';

const MsgDisplay = ({ msg}) => {

  return (
    <>
      <div className={styles.you_content}>
        <div>
          {msg.message && (
            <div className={styles.chat_text}>
              <small className={styles.time}>{msg.user}</small>
              {msg.message}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MsgDisplay;

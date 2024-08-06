import React, { useState } from 'react';

// COMPONENTS
import styles from '@/styles/index.module.css';
import LeftSide from '@/components/LeftSide';
import RightSide from '@/components/RightSide';

const Conversation = () => {
  const [showNav, setShowNav] = useState(false)

  return (
    <div className={styles.conversation}>
      <div className={`${styles.new_left_conversations} ${showNav ? styles.show_left_conversations : ""}`}>
        <LeftSide showNav={showNav} setShowNav={setShowNav} />
      </div>

      <div className={styles.new_right_conversations}>
        <RightSide showNav={showNav} setShowNav={setShowNav}/>
      </div>
    </div>
  );
};

export default Conversation;

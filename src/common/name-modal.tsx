import { ACTIONS } from "@/store/Actions";
import { DataContext } from "@/store/GlobalState";
import { useContext, useState } from "react";
import { Modal } from "react-bootstrap";
import styles from "@/styles/modal.module.css"
import { useRouter } from "next/router";

//

const NameModal = () => {
  const [name, setName] = useState("")
  const { dispatch, state } = useContext(DataContext)
  const router = useRouter()

  // handle join
  const handleJoin = () => {

    router.push(`/message/${state?.route}`)
    dispatch({type:ACTIONS.USER, payload:name})
    dispatch({type:ACTIONS.NAME_MODAL, payload:false})
  }
  //

  return (
    <Modal
      show={state?.nameModal}
      onHide={() => dispatch({ type: ACTIONS.NAME_MODAL, payload: false })}
      dialogClassName={styles.room_modal}
    >
      <div className={styles.name_modal}>
        <div className={styles.heading}>
          <h3>{state?.route} Room</h3>
        </div>

        <i onClick={() => dispatch({ type: ACTIONS.NAME_MODAL, payload: false })} className="bi bi-x-circle"></i>

        <div className={styles.form_box}>
          <label>
            Enter your dislay name to join
          </label>
          <input type="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <button onClick={handleJoin}>
          Join Room
        </button>
      </div>
    </Modal>
  );
};

export default NameModal;

import React from 'react';
import { FaPlus, FaMinus, FaWallet } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { Stack, IconButton, Text } from '@chakra-ui/core'
import { del } from 'idb-keyval'
import WalletContext from '../context/walletContext'

const SpeedDial= (props : any)=> {
  const [isOpen, setIsOpen] = React.useState(false);
  const wrapperRef = React.useRef(null);
  
  const SpeedDialItem = () => {
    const { state, dispatch } = React.useContext(WalletContext)
  
    return (
      <Stack isInline
        key="me"
        position="fixed"
        bottom="40px"
        right="0px"
        align="center">
        <Text fontSize={11}>{state.address === '' ? "Open Wallet" : "Close Wallet"}</Text>
        <IconButton aria-label="wallet" icon={FaWallet} isRound onClick={async () => {
          if (state.address !== '') {
            await del('wallet');
            dispatch({ type: 'ADD_WALLET', payload: { address: '', balance: '', key: '' } });
          }
          //@ts-ignore
          else props.onOpen()
        }} />
      </Stack>
    )
  }
  const useOutsideAlerter = (ref: any) => {
    React.useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target)) {
          setIsOpen(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
  useOutsideAlerter(wrapperRef);

  return (<div ref={wrapperRef} style={{position: "fixed", bottom: "20px", right:"20px"}}>
    <IconButton aria-label="open" isRound icon={isOpen ? FaMinus : FaPlus}  onClick={() => setIsOpen(!isOpen)} />
    <AnimatePresence>
      {isOpen &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ y: -20, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        ><SpeedDialItem /></motion.div>}
    </AnimatePresence>
  </div>)
}

export default SpeedDial
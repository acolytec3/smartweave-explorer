import React from 'react';
import { FaPlus, FaMinus, FaWallet, } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { Stack, IconButton, Text } from '@chakra-ui/core'
import { del } from 'idb-keyval'
import WalletContext from '../context/walletContext'

interface SpeedDialItemProps {
  icon: any, //Must pass an iconType object
  label: string
  clickHandler: () => void
}

const SpeedDialItem:React.FC<SpeedDialItemProps> = ({ icon, label, clickHandler }:SpeedDialItemProps) => {
  return (
    <Stack isInline
      position="fixed"
      bottom="100px"
      right="20px"
      align="center">
      <Text fontSize={11}>{label}</Text>
      <IconButton aria-label="wallet" icon={icon} isRound onClick={async () => clickHandler()} />
    </Stack>
  )
}

const SpeedDial = (props : any)=> {
  const [isOpen, setIsOpen] = React.useState(false);
  const wrapperRef = React.useRef(null);
  

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

  return (<div ref={wrapperRef} style={{position: "fixed", bottom: "50px", right:"20px"}}>
   <IconButton aria-label="open" isRound icon={isOpen ? <FaMinus />: <FaPlus />}  onClick={(evt: React.MouseEvent) => {console.log(evt);setIsOpen(!isOpen)}} />
      {isOpen ?
       <SpeedDialItem icon={<FaWallet />} label="Open Wallet" clickHandler={() => {
        props.onOpen()
      setIsOpen(false)
       }}/>
      :
      <SpeedDialItem icon={<FaWallet />} label="Close Wallet" clickHandler={() => {
        del('wallet')
      setIsOpen(false)
       }}/>
      }

  </div>)
}

export default SpeedDial

/*  Once Framer Motion tells me what's wrong with Safari
  return (<div ref={wrapperRef} style={{position: "fixed", bottom: "50px", right:"20px"}}>
   <IconButton aria-label="open" isRound icon={isOpen ? <FaMinus />: <FaPlus />}  onClick={(evt: React.MouseEvent) => {console.log(evt);setIsOpen(!isOpen)}} />
    <AnimatePresence>
      {isOpen &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ y: -20, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        ><SpeedDialItem key="1234" /></motion.div>}
    </AnimatePresence>
  </div>)
  */
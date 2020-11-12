import React from 'react'
import Camera, { FACING_MODES, IMAGE_TYPES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import { Button, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from "@chakra-ui/core";
import WalletContext from '../context/walletContext'
interface CameraProps {
    isOpen: boolean,
    close: (modal: string) => void,
    setTxnOpen: () => void
}
const CameraWindow : React.FC<CameraProps> = ({ isOpen, close, setTxnOpen }) => {
    const [dataUri, setDataUri] = React.useState('');
    const { dispatch } = React.useContext(WalletContext)
    function handleTakePhotoAnimationDone(dataUri: string) {
        console.log('takePhoto');
        setDataUri(dataUri);
    }

    const handleClose = () => {
        setDataUri('')
        close('camera')
    }
    const handleImageSave = () => {
        setDataUri('')
        dispatch({type:'SET_PICTURE', payload:{picture:dataUri}})
        setTxnOpen()
        close('camera')
    }

    const isFullscreen = false;
    return (
        <Modal closeOnOverlayClick={true} isOpen={isOpen} onClose={handleClose}>
            <ModalOverlay>
                <ModalContent>
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {
                            (dataUri)
                                ? <>
                                    <Image src={dataUri} />
                                    <Button onClick={handleImageSave}>Upload image to Arweave</Button>
                                </>
                                : <Camera onTakePhotoAnimationDone={handleTakePhotoAnimationDone}
                                    isFullscreen={isFullscreen}
                                    imageType = {IMAGE_TYPES.JPG}
                                    idealFacingMode = {FACING_MODES.ENVIRONMENT}
                                />
                        }
                    </ModalBody>
                </ModalContent>
            </ModalOverlay>
        </Modal>
    );
}

export default CameraWindow
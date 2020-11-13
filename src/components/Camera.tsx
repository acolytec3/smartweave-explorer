import React from 'react'
import Camera, { FACING_MODES, IMAGE_TYPES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import { Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack } from "@chakra-ui/core";
import WalletContext from '../context/walletContext'
import { IoMdRefreshCircle } from 'react-icons/io'
interface CameraProps {
    isOpen: boolean,
    close: (modal: string) => void,
    setTxnOpen: () => void
}
const CameraWindow: React.FC<CameraProps> = ({ isOpen, close, setTxnOpen }) => {
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
        dispatch({ type: 'SET_PICTURE', payload: { picture: dataUri } })
        setTxnOpen()
        close('camera')
    }

    return (
        <Modal closeOnOverlayClick={true} isOpen={isOpen} onClose={handleClose} >
            <ModalOverlay>
                <ModalContent>
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack align="center">
                            {(dataUri) ? <Image src={dataUri} />
                                : <Camera onTakePhotoAnimationDone={handleTakePhotoAnimationDone}
                                    imageType={IMAGE_TYPES.JPG}
                                    idealFacingMode={FACING_MODES.ENVIRONMENT}
                                    isImageMirror={false}
                                >
                                    <IconButton aria-label="refresh" icon={<IoMdRefreshCircle />} />
                                    </Camera>
                            }
                            <Button isDisabled={!dataUri} onClick={handleImageSave}>Next</Button>
                        </Stack>
                    </ModalBody>
                </ModalContent>
            </ModalOverlay>
        </Modal>
    );
}

export default CameraWindow
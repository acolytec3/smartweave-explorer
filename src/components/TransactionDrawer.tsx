
import React from 'react'
import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton, Button, Input, Box, Text, Stack,
    useToast,
    SimpleGrid,
    Heading,
    Spinner
} from "@chakra-ui/core";
import Dropzone from 'react-dropzone'
import WalletContext from '../context/walletContext'
import { getFee, uploadFile } from '../providers/wallets'
interface TxnDrawerProps {
    isOpen: boolean,
    close: () => void,
}

interface TagsProps {
    tags: {
        name: string,
        value: string
    }[],
    clickHandler: (name: string, value: string) => void
}

const Tags: React.FC<TagsProps> = ({ tags, clickHandler }) => {
    const [name, setName] = React.useState('')
    const [value, setValue] = React.useState('')
    return (
        <Stack>
            <Heading size="sm">Transacion Tags</Heading>
            {tags.map((tag) => {
                return (<SimpleGrid key={tag.name + tag.value} columns={2} fontSize={12}>
                    <Text>Name: {tag.name}</Text>
                    <Text>Value: {tag.value}</Text>
                </SimpleGrid>)
            }
            )}
            <Input placeholder="Name" value={name} onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setName(evt.target.value)} />
            <Input placeholder="Value" value={value} onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setValue(evt.target.value)} />
            <Button isDisabled={(name === '' || value === '')}
                onClick={() => {
                    clickHandler(name, value)
                    setName('')
                    setValue('')
                }}>
                Add Tag</Button>
        </Stack>
    )
}

const TransactionDrawer: React.FC<TxnDrawerProps> = ({ isOpen, close }) => {
    const { state } = React.useContext(WalletContext)
    const toast = useToast();
    const [data, setData] = React.useState(null as any)
    const [tags, setTags] = React.useState([] as { name: string; value: string; }[])
    const [fee, setFee] = React.useState('0')
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if (state.picture) {
            fetch(state.picture).then((res) => {
            return res.blob()
            }).then((blob) => {
                //@ts-ignore
                onDrop([blob]
            )})
    }},[state.picture])

    const tagsHandler = (name: string, value: string) => {
        if (tags !== undefined) {
            let newTags = [...tags!, { name, value }]
            setTags(newTags)
        }
        else setTags([{ name, value }])
    }

    const handleClose = () => {
        setData(null);
        setTags([]);
        close()
    }

    const handleUpload = async () => {
        setLoading(true)
        let res = await uploadFile(data, state.key, tags)
        if (res.startsWith('Transaction')){
            toast({
                title: 'Success',
                status: 'success',
                duration: 3000,
                position: 'bottom',
                description: 'Your file has been submitted to the blockchain'
            })
        }
        else {
            toast({
                title: 'Error submitting transaction',
                status: 'error',
                duration: 3000,
                position: 'bottom',
                description: res
            })
        }

        setTimeout(() => {
            setLoading(false)
            handleClose()}
            ,1000)
    }

    const onDrop = async (acceptedFiles: File[]) => {
        const reader = new FileReader()
        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = async function (event) {
            if (event && event.target) {
                let contents = acceptedFiles[0]
                let tags = [
                    { 'name': 'App-Name', 'value': 'ArMob 2.0' },
                    { 'name': 'Content-Type', 'value': acceptedFiles[0].type }
                ]
                let fee = await getFee(acceptedFiles[0].size)
                setFee(fee)
                setData(contents)
                setTags(tags)
            }

        }
        try {
            reader.readAsText(acceptedFiles[0])
        }
        catch (err) {
            console.log('Unable to process file', err)
            toast({
                title: 'Error processing file',
                status: 'error',
                duration: 3000,
                position: 'bottom',
                description: 'Please try again'
            })
        }
    }

    return (
        <>
            <Drawer isOpen={isOpen} placement="right" onClose={close} isFullHeight>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton onClick={handleClose} />
                    <DrawerHeader>Upload file to Arweave</DrawerHeader>
                    <DrawerBody>
                        {!data && <Box w="100%" borderStyle='dashed' borderWidth="2px">
                            <Dropzone onDrop={onDrop}>
                                {({ getRootProps, getInputProps }) => (
                                    <section>
                                        <div {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <Box flexDirection="row" padding={3}><Text fontSize={14} textAlign="center">Drop a file or click to select from system file picker</Text></Box>
                                        </div>
                                    </section>
                                )}
                            </Dropzone>
                        </Box>}
                        {data && !loading && <Stack>
                            <Text>Fee: {fee} AR</Text>
                            <Tags tags={tags} clickHandler={tagsHandler} />
                            </Stack>}
                        {data && loading && <Spinner />}
                    </DrawerBody>
                    <DrawerFooter>
                        <Button variant="outline" mr={3} onClick={handleClose}>Cancel</Button>
                        <Button color="blue" onClick={handleUpload}>Upload File</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default TransactionDrawer
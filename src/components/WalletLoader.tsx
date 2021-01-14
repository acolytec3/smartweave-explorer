import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  Stack,
  Text,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import { generateMnemonic, getKeyFromMnemonic } from "arweave-mnemonic-keys";
import { set } from "idb-keyval";
import React from "react";
import Dropzone from "react-dropzone";
import { FaCheck, FaGripHorizontal, FaKey, FaTrash } from "react-icons/fa";
import WalletContext, { wallet } from "../context/walletContext";
import { addWallet } from "../providers/wallets";

const WalletLoader = () => {
  const toast = useToast();
  const { state, dispatch } = React.useContext(WalletContext);
  const [loading, setLoading] = React.useState(false);
  const [address, setAddress] = React.useState("");
  const [copiedValue, setCopiedValue] = React.useState<string>("");
  const { onCopy } = useClipboard(copiedValue);

  const onDrop = async (acceptedFiles: any) => {
    const reader = new FileReader();
    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.onload = async function (event) {
      setLoading(true);
      if (acceptedFiles[0].type === "application/json") {
        try {
          let walletObject = JSON.parse(event!.target!.result as string);
          let walletDeets = await addWallet(walletObject);
          await set("wallet", JSON.stringify(walletObject));
          dispatch({
            type: "ADD_WALLET",
            payload: { ...walletDeets, key: walletObject, mnemonic: walletObject.mnemonic },
          });
          set('wallets', JSON.stringify(state))
        } catch (err) {
          console.log("Invalid json in wallet file");
          toast({
            title: "Error loading wallet",
            status: "error",
            duration: 3000,
            position: "bottom-left",
            description: "Invalid JSON in wallet file",
          });
        }
      } else {
        console.log("Invalid file type");
        toast({
          title: "Error loading wallet",
          status: "error",
          duration: 3000,
          position: "bottom-left",
          description: "Invalid file type",
        });
      }
      setLoading(false);
    };
    try {
      reader.readAsText(acceptedFiles[0]);
    } catch (err) {
      console.log("Invalid file type");
      toast({
        title: "Error loading wallet",
        status: "error",
        duration: 3000,
        position: "bottom-left",
        description: "Invalid file type",
      });
    }
  };

  const loadWalletFromMnemonic = async (mnemonic: string) => {
    setLoading(true);
    let walletObject = await getKeyFromMnemonic(mnemonic);
    let walletDeets = await addWallet(walletObject);
    await set("wallet", JSON.stringify(walletObject));
    setLoading(false);
    dispatch({
      type: "ADD_WALLET",
      payload: { ...walletDeets, key: walletObject, mnemonic: mnemonic },
    });
    set('wallets', JSON.stringify(state))
  };

  const generateWallet = async () => {
    setLoading(true);
    let mnemonic = await generateMnemonic();
    setAddress(mnemonic);
    loadWalletFromMnemonic(mnemonic);
  };

  const addAddress = async () => {
    setLoading(true);
    let walletDeets = await addWallet(address);
    dispatch({ type: "ADD_WALLET", payload: { ...walletDeets, key: "" } });
    set('wallets', JSON.stringify(state))
  };

  const createWalletFile = async (wallet: wallet) => {
    const blob = new Blob([JSON.stringify({...wallet.key, mnemonic: wallet.mnemonic}, null, 2)], {
      type: "application/json",
    });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `arweave-keyfile-${wallet.address}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const switchWallet = async (address: string) => {
    let wallet = await addWallet(address);
    dispatch({
      type: "CHANGE_ACTIVE_WALLET",
      payload: { address: wallet.address, balance: wallet.balance },
    });
  };

  return (
    <Stack align="center">
      <Skeleton isLoaded={!loading}>
        <Box w="100%" borderStyle="dashed" borderWidth="2px" mb={2}>
          <Dropzone onDrop={onDrop}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Box flexDirection="row" padding={3}>
                    <Text fontSize={14} textAlign="center">
                      Drop a wallet file or click to load wallet
                    </Text>
                  </Box>
                </div>
              </section>
            )}
          </Dropzone>
        </Box>
        <Stack w="100%" mb={2}>
          <Heading size="xs">Wallet mnemonic</Heading>
          <Input
            w="93%%"
            placeholder="Enter 12 word seedphrase"
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setAddress(evt.target.value);
            }}
          />
          <Button
            isDisabled={address === ""}
            onClick={() => loadWalletFromMnemonic(address)}
          >
            Load Wallet
          </Button>
        </Stack>
        <Stack w="100%">
          <Heading size="xs">Track a Wallet</Heading>
          <Input
            w="93%%"
            placeholder="Enter a wallet address"
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
              setAddress(evt.target.value);
            }}
          />
          <Button isDisabled={address === ""} onClick={() => addAddress()}>
            Track Address
          </Button>
          <Button mt={2} onClick={generateWallet}>
            Generate New Wallet
          </Button>
        </Stack>
      </Skeleton>
      {state.address && (
        <>
          <Divider />
          <Heading size="sm">Loaded Wallets</Heading>
        </>
      )}
      {state.wallets.length > 0 &&
        state.wallets.map((wallet) => {
          console.log(wallet);
          return (
            <Stack isInline align="start">
              <Popover>
                <PopoverTrigger>
                  <Text
                    whiteSpace="nowrap"
                    overflow="hidden"
                    maxWidth="90vw"
                    textOverflow="ellipsis"
                    cursor="pointer"
                  >
                    {wallet.address}
                  </Text>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverBody>
                    <Stack isInline justifyContent="space-around">
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        key={wallet.address + "pseudo2"}
                        as="button"
                        onClick={() => {
                          switchWallet(wallet.address);
                        }}
                        alignContent="start"
                      >
                        <FaCheck size={16} />
                        <Text>Use</Text>
                      </Flex>
                      <Flex
                        as="button"
                        direction="column"
                        align="center"
                        justify="center"
                        onClick={() => {
                          dispatch({
                            type: "REMOVE_WALLET",
                            payload: { address: wallet.address },
                          });
                        }}
                      >
                        <FaTrash size={16} />
                        <Text>Remove</Text>
                      </Flex>
                      <Flex
                        as="button"
                        direction="column"
                        align="center"
                        justify="center"
                        onClick={() => createWalletFile(wallet)}
                      >
                        <FaKey size={16} />
                        <Text>Download Keyfile</Text>
                      </Flex>
                      {wallet.mnemonic && (
                        <Flex
                          as="button"
                          direction="column"
                          align="center"
                          justify="center"
                          onClick={() => {
                            if (wallet.mnemonic)
                              setCopiedValue(wallet.mnemonic);
                            onCopy();
                          }}
                        >
                          <FaGripHorizontal size={16} />
                          <Text>Copy Seedphrase</Text>
                        </Flex>
                      )}
                    </Stack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Stack>
          );
        })}
    </Stack>
  );
};

export default WalletLoader;

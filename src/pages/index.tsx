import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Box, Code, Grid, GridItem, SlideFade, Spinner, Text, useToast } from '@chakra-ui/react'
import { MoonIcon } from '@chakra-ui/icons'
import { FileUploader } from 'react-drag-drop-files'
import { useEffect, useState } from 'react'
import axios, { AxiosResponse } from 'axios'
import { OPENAI_ENDPOINT_CALL_GPT3, OPENAI_ENDPOINT_CALL_GPT3_2, OPENAI_ENDPOINT_CALL_GPT3_3, OPENAI_ENDPOINT_CALL_SLEITHER, OPENAI_ENDPOINT_UPLOAD } from '@/utils/constants'

import CopyToClipboard from "react-copy-to-clipboard";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

const fileTypes = ["sol"];

export default function Home() {
  
  const toast = useToast();

  const [loading, setLoading] = useState<boolean>(false);
  const [solFile, setSolFile] = useState<File>();

  const [explanationResp, setExplanationResp] = useState<AxiosResponse<any, any>>();
  const [unitTestsResponse, setUniTestResponse] = useState<AxiosResponse<any, any>>();
  const [staticAnalysisResponse, setStaticAnalysisResponse] = useState<AxiosResponse<any, any>>();

  const handleChange = async (file: File) => {
    setSolFile(file);
    
    setExplanationResp(undefined)
    setUniTestResponse(undefined)
    setStaticAnalysisResponse(undefined)

    const uploadFile = async() => {
      const formData = new FormData()
      formData.append("contract", file!);
      try {
        setLoading(true);
        const response = await axios({
          method: "post",
          url: OPENAI_ENDPOINT_UPLOAD,
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
        });

        const unit_test_response = await axios.get(OPENAI_ENDPOINT_CALL_GPT3_2,
          { params: { contractName: solFile?.name.slice(0, solFile!.name.length - 4) } }
        );
        
        // console.log('[----] unit_testresponse', unit_test_response.data);
        setUniTestResponse(unit_test_response);

        const audit_response = await axios.get(OPENAI_ENDPOINT_CALL_SLEITHER,
          { params: { contractName: solFile?.name.slice(0, solFile!.name.length - 4) } }
        );
        
        // console.log('[----] audit_response', audit_response.data);
        setStaticAnalysisResponse(audit_response);

        const explanation_resp = await axios.post(OPENAI_ENDPOINT_CALL_GPT3_3,
          { params: { contractName: solFile?.name.slice(0, solFile!.name.length - 4) } }
        );
        
        // console.log('[----] unit_testresponse', unit_test_response.data);
        setExplanationResp(explanation_resp);

        setLoading(false);
      } catch(error) {
        setLoading(false);

        toast({
          title: 'Error.',
          description: `Something went wrong while getting responses`,
          status: 'error',
          duration: 9000,
          isClosable: true,
        })

        console.log(error)
      } finally {
        setLoading(false);
      }
    }
    
    if (file) {
      toast({
        title: "File uploaded",
        description: "We've successfully uploaded your smart contract file.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });

      uploadFile();
    }
  };
  
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Box display="flex" flexDirection={"column"} alignItems="center">
          <MoonIcon w={28} h={28} color="blue.200" />
          <Text fontSize="5xl" fontWeight="semibold">
            Welcome to Blue Moon
          </Text>
          <Box
            display={"flex"}
            alignItems="center"
            w="100%"
            justifyContent="end"
            pt={2}
          >
            <Text pr={3} fontSize="lg" fontWeight="semibold">
              Powered by
            </Text>
            <Image
              className={styles.logo}
              src="/OpenAI_Logo.svg"
              alt="openai"
              width={120}
              height={20}
            ></Image>
          </Box>
        </Box>

        <Box
          py={32}
          w="100%"
          display="flex"
          flexDirection={"column"}
          alignItems="center"
        >
          <Text fontSize="3xl" fontWeight="semibold">
            Drop your Ethereum Smart Contract here
          </Text>

          <Box
            shadow="lg"
            borderRadius="3xl"
            w={450}
            my={10}
            py={10}
            display="flex"
            justifyContent="center"
            bg="blue.100"
          >
            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            ) : (
              <FileUploader
                handleChange={handleChange}
                name="file"
                types={fileTypes}
              />
            )}
          </Box>

          {/* Explanation */}
          <Box
            pt={32}
            w="100%"
            display="flex"
            flexDirection={"column"}
            alignItems="center"
          >
            {explanationResp && (
              <Box
                w="100%"
                display="flex"
                flexDirection={"column"}
                alignItems="center"
              >
                <Text fontSize="3xl" fontWeight="semibold">
                  Here is a quick explanation of your Smart Contract.
                </Text>

                <SlideFade
                  in={typeof explanationResp !== "undefined"}
                  offsetY="20px"
                >
                  <Box
                    p="40px"
                    color="white"
                    mt="4"
                    bg="teal.500"
                    rounded="md"
                    shadow="md"
                  >
                    {explanationResp.data}
                  </Box>
                </SlideFade>
              </Box>
            )}

            {/* Unit Test Code Examples */}

            {unitTestsResponse && (
              <Box
                pt={48}
                w="100%"
                display="flex"
                flexDirection={"column"}
                alignItems="center"
              >
                <Text fontSize="3xl" fontWeight="semibold">
                  We take care of what you hate most, some boilerplate Unit
                  Tests
                </Text>

                <SlideFade
                  in={typeof unitTestsResponse !== "undefined"}
                  offsetY="20px"
                >
                  <Box
                    p="40px"
                    color="white"
                    mt="4"
                    bg="teal.500"
                    rounded="md"
                    shadow="md"
                  >
                    <SyntaxHighlighter language="" style={docco}>
                      {unitTestsResponse.data}
                    </SyntaxHighlighter>
                  </Box>
                </SlideFade>
              </Box>
            )}

            {/* Static Analysis */}
            {staticAnalysisResponse && (
              <Box
                pt={48}
                w="100%"
                display="flex"
                flexDirection={"column"}
                alignItems="center"
              >
                <Text fontSize="3xl" fontWeight="semibold">
                  We also run a static analysis, here is what it has to say
                </Text>
                <Text fontSize="lg" fontWeight="regular">
                  Powered by Slither
                </Text>

                <SlideFade
                  in={typeof staticAnalysisResponse !== "undefined"}
                  offsetY="20px"
                >
                  <Box
                    p="40px"
                    color="white"
                    mt="4"
                    bg="teal.500"
                    rounded="md"
                    shadow="md"
                  >
                    {staticAnalysisResponse.data}
                  </Box>
                </SlideFade>
              </Box>
            )}
          </Box>
        </Box>
      </main>
    </>
  );
}

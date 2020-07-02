import {
  Box,
  Text,
  Link,
  FormField,
  Input,
  useViewport,
  useGlobalConfig,
  Heading,
  Button,
  Icon,
  Loader,
} from '@airtable/blocks/ui';
import React, { useState, useEffect } from 'react';
import { BING_API_KEY } from './settings';
import { ImageSearchClient, ImageSearchModels } from '@azure/cognitiveservices-imagesearch'
import { CognitiveServicesCredentials } from './CognitiveServicesCredentials'
import { BingSearchClient } from './BingSearchClient'

export function Welcome({ appState, setAppState, setIsSettingsVisible }) {
  // Check if we've Flickr API Key available, if yes, just move onto the next state else 
  // welcome user to the block (probably running it for the first time / a new base installation)
  const globalConfig = useGlobalConfig();
  const apiKeyExists = globalConfig.get(BING_API_KEY) as string;
  const [apiKey, setApiKey] = useState(apiKeyExists || "");
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const viewport = useViewport();
  const saveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    const bingClient = new BingSearchClient(apiKey);
    bingClient.search("cats")
      .then(function (res) {
        console.log(res);
        setLoading(false);
        setErrorMessage("");

        globalConfig.setAsync(BING_API_KEY, apiKey);
        setAppState({ index: 1 });
        setIsSettingsVisible(false);
      }).catch(function (err) {
        setLoading(false);
        setErrorMessage(err.message);
      });
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" border="default" flexDirection="column" width={viewport.size.width} height={viewport.size.height} padding={0}>
      <Box maxWidth='650px'>
        <Box paddingBottom='10px'>
          <Heading size="xlarge">Welcome to Bing Image Search &amp; Import</Heading>
        </Box>

        <Box paddingBottom='10px'>
          <Text textAlign='justify' size="xlarge">Search and import images from <Link size="xlarge" href="https://www.bing.com/" target="_blank">Bing</Link> into your base for collecting image data.</Text>
        </Box>

        <Box paddingBottom='10px'>
          <Text variant="paragraph" size="xlarge">
            To use this block within your base you need to create a <Link size="xlarge" href="https://docs.microsoft.com/en-us/azure/cognitive-services/cognitive-services-apis-create-account">Cognitive Services API Account</Link>.
          </Text>
        </Box>
        <form onSubmit={saveSettings}>
          <Box>
            <FormField label="Cognitive Services API Key">
              <Input value={apiKey} onChange={e => setApiKey(e.target.value)} />
            </FormField>
          </Box>

          <Box>
            {
              errorMessage !== "" && <Text paddingBottom='5px' textColor='red'>Note: {errorMessage}</Text>
            }
            <Button icon={isLoading && <Loader /> || <Icon name='premium' fillColor='yellow' />} variant="primary" disabled={(!apiKey || apiKey === "") || isLoading} onClick={saveSettings}>Start Importing</Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}

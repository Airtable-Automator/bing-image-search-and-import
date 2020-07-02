import {
  Box,
  Input,
  Button,
  Loader,
  Heading,
  Dialog,
  Text,
  useViewport,
  useGlobalConfig,
} from '@airtable/blocks/ui';
import React, { useState } from 'react';
import CSS from 'csstype';
import _ from 'lodash';
import { BING_API_KEY } from './settings';
import { BingSearchClient } from './BingSearchClient';

export function SearchPage({ appState, setAppState }) {
  const viewport = useViewport();
  const globalConfig = useGlobalConfig();

  const [isLoading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [searchText, setSearchText] = useState(_.get(appState, "state.search.text", "cats"));
  const searchBoxStyle: CSS.Properties = {
    cursor: 'text'
  }

  const performSearch = (e) => {
    e.preventDefault();
    setLoading(true);

    // this size of 1501, comes from showing thumbnails of size 150x150 in the search results.
    viewport.addMaxFullscreenSize({ width: 1501 });

    const apiKey = globalConfig.get(BING_API_KEY) as string;
    const bing = new BingSearchClient(apiKey);
    bing.search(searchText)
      .then(function (res) {
        viewport.enterFullscreenIfPossible();
        setLoading(false);
        setAppState({
          index: 2,
          state: {
            search: {
              text: searchText,
              page: 1,
              per_page: res.value.length,
            },
            results: res.value,
          }
        });
      }).catch(function (err) {
        setLoading(false);
        setErrorMsg(err.message);
        setIsDialogOpen(true);
      });
  }

  return (
    // main box
    <form onSubmit={performSearch}>
      <Box
        width={viewport.size.width}
        height={viewport.size.height}
        display="flex"
        flexDirection='column'
        alignItems="center"
        justifyContent="center"
        padding={0}>
        <Heading size="xlarge">Search Bing</Heading>
        {
          isLoading &&
          <Box display='block' zIndex={10}><Loader scale={0.5} /></Box>
        }
        {
          isDialogOpen &&
          <Dialog onClose={() => setIsDialogOpen(false)} width="420px">
            <Dialog.CloseButton />
            <Heading>Error</Heading>
            <Text variant="paragraph">{errorMsg}</Text>
            <Heading size="small">Possible Solutions</Heading>
            <Text>
              <ol>
                <li>Check the API Key on the Settings of the block.</li>
              </ol>
            </Text>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </Dialog>

        }
        <Box width={viewport.size.width / 2} paddingTop='12px' paddingBottom='12px'>
          <Input
            value={searchText}
            size="large"
            onChange={e => setSearchText(e.target.value)}
            placeholder="animals"
            style={searchBoxStyle}
            width='100%'
            disabled={isLoading}
          />
        </Box>
        <Box paddingTop='12px' paddingBottom='12px'>
          <Button size="large" icon='search' onClick={performSearch} disabled={isLoading}>Find Images</Button>
        </Box>
      </Box>
    </form>
  )
}
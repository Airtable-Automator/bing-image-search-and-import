import {
  Heading,
  Box,
  Button,
  useViewport,
} from '@airtable/blocks/ui';
import React, { useState } from 'react';
import _ from 'lodash';

export function ThankYou({ appState, setAppState }) {
  const viewport = useViewport();
  const recordsAdded = _.get(appState, "state.selection", []).length;

  const startOver = () => {
    // hard-reset all the custom state to start over once again.
    setAppState({ index: 1 });
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" border="default" overflow="hidden" width={viewport.size.width} height={viewport.size.height} padding={0}>
      <Heading size="xlarge">{recordsAdded} records successfully imported into the table.</Heading>
      <Button icon='redo' onClick={startOver}>Add more</Button>
    </Box>
  )
}
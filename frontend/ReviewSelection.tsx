import {
  Heading,
  Box,
  Button,
  Link,
  Text,
  useViewport,
  useBase,
  Loader,
} from '@airtable/blocks/ui';
import _ from 'lodash';
import React, { useState, PureComponent } from 'react';
import CSS from 'csstype';
import { FieldType } from '@airtable/blocks/models';
import { createRecordsInBatches } from './utils';
import { thumbnailUrlFor, FIXED_THUMBNAIL_HEIGHT, FIXED_THUMBNAIL_WIDTH } from './settings';

export function ReviewSelection({ appState, setAppState }) {
  const viewport = useViewport();
  const base = useBase();
  const [isLoading, setLoading] = useState(false);

  const itemsToReview = appState.state.selection;

  const topbarStyle: CSS.Properties = {
    position: 'fixed',
    backgroundColor: 'white',
    zIndex: 10,
  }
  const imageTitleTextStyle: CSS.Properties = {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '300px',
    overflow: 'hidden',
  }

  const settingsSidebarStyle: CSS.Properties = {
    flexFlow: 'column wrap',
    marginTop: '5px',
    marginBottom: '5px',
    justifyContent: "left",
    width: '500px',
    height: '100vh',
  }

  const backToSearch = () => {
    const updatedAppState = { ...appState };
    updatedAppState.index = 2;
    setAppState(updatedAppState);
  }

  const importImages = async () => {
    setLoading(true);
    const nameOfTable = "Bing Dataset" // Make this configurable with a sensible default
    const fields = [
      { name: 'Name', type: FieldType.SINGLE_LINE_TEXT },
      { name: 'Source Name', type: FieldType.SINGLE_LINE_TEXT },
      { name: 'Source Url', type: FieldType.SINGLE_LINE_TEXT },
      { name: 'Is Family Friendly', type: FieldType.SINGLE_LINE_TEXT },
      { name: 'Image URL', type: FieldType.URL },
      { name: 'Image', type: FieldType.MULTIPLE_ATTACHMENTS },
    ]

    let table = base.getTableByNameIfExists(nameOfTable);

    if (!table) {
      // TODO: Do this check upfront when the app is starting, to display relevant error message.
      if (base.unstable_hasPermissionToCreateTable(nameOfTable, fields)) {
        await base.unstable_createTableAsync(nameOfTable, fields);
      }
      table = base.getTableByName(nameOfTable);
    }

    const createUnknownRecordCheckResult = table.checkPermissionsForCreateRecord();
    if (!createUnknownRecordCheckResult.hasPermission) {
      alert("You don't have permissions to insert new records to " + nameOfTable + ".");
      return;
    }

    const newRecords = itemsToReview.map(pic => {
      return {
        fields: {
          'Name': pic.name,
          'Source Name': pic.hostPageDomainFriendlyName,
          'Source Url': pic.hostPageUrl,
          'Is Family Friendly': pic.isFamilyFriendly ? "Yes" : "No",
          'Image URL': pic.contentUrl,
          'Image': [{ url: pic.contentUrl }],
        },
      }
    });
    createRecordsInBatches(table, newRecords);

    setLoading(false);
    const updatedAppState = { ...appState };
    updatedAppState.index = 4;
    setAppState(updatedAppState);
  }

  return (
    <Box>
      <Box display="flex" height={50} borderBottom='thick' width={viewport.size.width} justifyContent="space-between" alignItems="center" style={topbarStyle}>
        <Box paddingLeft='10px'>
          <Heading>Review Selection of {itemsToReview.length} item(s)</Heading>
        </Box>
        <Box display="flex" justifyContent="right">
          <Box paddingRight='10px'>
            <Button variant="danger" size="large" onClick={backToSearch}>Back to Results</Button>
          </Box>
          <Box paddingRight='10px'>
            <Button
              variant="primary"
              size="large"
              icon={isLoading ? <Loader fillColor="#fff" /> : "download"}
              disabled={_.isEmpty(itemsToReview) || isLoading}
              onClick={importImages}>
              Import{isLoading && "ing..."}
            </Button>
          </Box>
        </Box>
      </Box>

      <Box display="flex" paddingTop='50px' marginLeft='10px' marginRight='10px'>
        <Box display="flex" overflow='auto' justifyContent="right">
          <Box display="flex" flexWrap="wrap">
            {
              itemsToReview.map(pic => {
                return (
                  <Box border="thick" width='100%' display="flex" justifyContent="space-between" key={pic.imageId} marginTop='5px' marginBottom='5px'>
                    <Box paddingTop='10px' paddingLeft='10px' display="block" justifyContent="left">
                      <Heading size="xsmall">{pic.name}</Heading>
                      <Box display="flex" marginTop='3px'>
                        <Box display='block' width='200px' paddingRight='5px'>
                          <Heading variant="caps" size="xsmall" textColor="light">Source Name</Heading>
                          <Text>{pic.hostPageDomainFriendlyName || "N/A"}</Text>
                        </Box>

                        <Box display='block' width={viewport.size.width - (1000)} paddingBottom='10px'>
                          <Heading variant="caps" size="xsmall" textColor="light">Source Url</Heading>
                          <Box display="flex" flexWrap="wrap">
                            <Link href={pic.hostPageUrl}>{pic.hostPageUrl}</Link>
                          </Box>
                        </Box>

                        <Box display='block' width='125px' paddingBottom='10px'>
                          <Heading variant="caps" size="xsmall" textColor="light">Is Family Friendly</Heading>
                          <Box display="flex" flexWrap="wrap">
                            <Text>{pic.isFamilyFriendly ? "Yes" : "No"}</Text>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Box display="flex" justifyContent="right" alignItems='center'>
                      <img src={thumbnailUrlFor(pic)} height={FIXED_THUMBNAIL_HEIGHT} width={FIXED_THUMBNAIL_WIDTH} />
                    </Box>
                  </Box>
                );
              })
            }
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
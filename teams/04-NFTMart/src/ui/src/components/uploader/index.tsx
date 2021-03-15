import React, { useState } from 'react';
import { Input, Image } from '@chakra-ui/react';
import { IPFS_POST_SERVER, IPFS_GET_SERVER } from '../../constants';

const ipfsClient = require('ipfs-http-client');

export default function Uploader() {
  const [cid, setCid] = useState();

  const saveToIpfs = async (files = []) => {
    const ipfs = ipfsClient(IPFS_POST_SERVER);
    if (files.length === 0) {
      return;
    }
    try {
      const added = await ipfs.add(files[0], {
        progress: (prog: any) => console.log(`received: ${prog}`),
      });
      // console.log(added.cid.toString(), '=============');
      setCid(added.cid.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
  };

  const captureFile = (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    saveToIpfs(event.target.files);
  };

  return (
    <form id="capture-media" onSubmit={handleSubmit}>
      <Input type="file" onChange={captureFile} />
      <br />
      {cid && <Image src={`${IPFS_GET_SERVER}/${cid}`} />}
    </form>
  );
}

/// Convert below network describe configurations:
///
///```yaml
// name: develop
// id: develop
// groups:
//   - name: group1
//     peers:
//       - name: peer1
//         is_root: true
//         is_group_main: true
//         ip: 127.0.0.1
//         port: 30333
//         ws_port: 9944
//         rpc_port: 9933
//       - name: peer2
//         ip: 127.0.0.1
//         port: 30334
//         ws_port: 9945
//         rpc_port: 9934
//   - name: group2
//     peers:
//       - name: peer1
//         is_group_main: true
//         ip: 127.0.0.1
//         port: 30335
//         ws_port: 9946
//         rpc_port: 9935
//       - name: peer2
//         ip: 127.0.0.1
//         port: 30336
//         ws_port: 9947
//         rpc_port: 9936
/// ```
/// to
///
/// ```yaml
// id: develop
// name: develop
// peers:
//   - name: peer1
//     group: group1
//     is_root: true
//     is_group_main: true
//     ip: 127.0.0.1
//     port: 30333
//     ws_port: 9944
//     rpc_port: 9933
//     node_key: 09c276562925d2a7e3b5270f374041f8f69f607a65cbff1b31b9c7e03d8dcb5e
//     peer_id: 12D3KooWN2nr9yzWF7BkwptKDGm3qhdwfkVaE1bP6A6ad6GdKuUJ
//     peer_id_hex: 002408011220b57b1e372cfb613249ce9e03a86776951871c9d589f63fce21108498bfd54b2f
//     secret:
//       phrase: absent blue mom theory correct code recycle awkward dutch salon certain aim
//       seed: b6d345abf798e9e025b4d163e4ce5d66a0d0ec6bb2a8f8af54b0f2fb28b52ac8
//       sr25519_public_key: 0650bc102848ef39a010488e999271eb28e2574ef9834c2c96a8cfa8fc758464
//       sr25519_ss58_address: 5CCz8MhobTqBd2rpd6jft5fUurENbGSzbgqdPEzYS882ES6x
//       ed25519_public_key: 56cfea38efa5956dc42e274658cdfea3f97feeff51e9915fcb825fdbd4f53195
//       ed25519_ss58_address: 5E2Xjor8ZyVNjcLVqaJXbTBdwdMDqC4uMa1SS7rLYmvCPiwb
//   - name: peer2
//     group: group1
//     is_root: false
//     is_group_main: false
//     ip: 127.0.0.1
//     port: 30334
//     ws_port: 9945
//     rpc_port: 9934
//     node_key: 46606891e39cc0a183c4fea9c15bcf4962cf8150726898f3f8f51b3d7b1e1ba4
//     peer_id: 12D3KooWFEB9SJi1kqg1KpKkskLqrWYRBRgroMpjCYULpWRG4z4A
//     peer_id_hex: 0024080112205063e92bbbaba5b22caacce1521ded149f0ee2e61849d367a387db166f5b0ee3
//     secret:
//       phrase: canyon obtain cage empty when million horn armor blush depth unlock venue
//       seed: b47f2cdb148f1250b62ff3e634d3abe4e57b53bc0ea92744d0655439e7077ef0
//       sr25519_public_key: b4736572cd1e0719913fa2847f3004c97884a1ead133ca39d2655c9316ffe26e
//       sr25519_ss58_address: 5G9JkpKkXWv7Gs68Y3cy9MJzrR14Pqr1qwbXwsfPtCQ8h9kR
//       ed25519_public_key: 0b2d81fe077b46ef41c72b983fcdc26485768d3df1189c4dc4822c7047e241da
//       ed25519_ss58_address: 5CKMuJMZB6dXxKTBZCaQcJzYki4NUVczmhAof4ywcx8Qj7CK
//   - name: peer1
//     group: group2
//     is_root: false
//     is_group_main: true
//     ip: 127.0.0.1
//     port: 30335
//     ws_port: 9946
//     rpc_port: 9935
//     node_key: ecf82a700d546c7f40dd4e10838d740478246835dbb724567524b492888d1b11
//     peer_id: 12D3KooWCNt9Y8FWZczRyJUFiaDnuE3SiYbCw47fNzXKchKijSQS
//     peer_id_hex: 002408011220260bdb7963d8409feb03699b06c2949ca7c7d772759416d5511ccc317f5368b3
//     secret:
//       phrase: relief hip exact celery lonely maid radio lobster uphold express critic lend
//       seed: 955b5e50fa7750c13b291d1e261b1ec261f7b23ad70b42546f2cdb309c363270
//       sr25519_public_key: fc9da07c8cbf243a44e0d86428ff2ba1eac45cef902b6e6b07df8c382015a34a
//       sr25519_ss58_address: 5HmvkQ9PTk7e7xWfHQrgPHsKtFSxy1r5Bh3dxeoWPMp2Ppze
//       ed25519_public_key: a876bfc4cc585c376545e17b86bf48360f2ce652b27d6d6846add5fdfd2ce54c
//       ed25519_ss58_address: 5FsbBFqWTb9ywGGbFrrb5KeQSxhAeasD7ysMM42FshD38gqr
//   - name: peer2
//     group: group2
//     is_root: false
//     is_group_main: false
//     ip: 127.0.0.1
//     port: 30336
//     ws_port: 9947
//     rpc_port: 9936
//     node_key: 598bcb3c2d6c5a033e65b956fcb71e48e1e5d96381d5e32b3a94567502035834
//     peer_id: 12D3KooWBZ2cBFRnh9THe6kUKTnNHWxSvSP7drqnN4Vc4eh7zjb9
//     peer_id_hex: 00240801122019c98b202745780b5b32ed1e0b6a5f112805eb7f6518557ee5f99ccf704e77ac
//     secret:
//       phrase: lyrics unable shrug able muscle loan bring guard save nominee cave promote
//       seed: 4f2c85a99958e9b65d107de9e1aa11584e11efaee396b9385f444c7a0b22bfce
//       sr25519_public_key: 3e6fb1f0833e8ba8cf3c0cb35ee0f3e654178328c03bb1ef09ad3780975d510a
//       sr25519_ss58_address: 5DUa1KiY6BsE5kAUSvMt9ekow1GHNyYL5rRs1YHjWzxM9kso
//       ed25519_public_key: 8c28e408c652102cee5c6ab8b9864bd44acae8b765078f429af9b0940bca55a9
//       ed25519_ss58_address: 5FEUi2Lk12EgG5iquuLDjrDhernTyo2T935MgCx3dEsyg3xW
/// ```

use hex;
use std::fs;
use serde_yaml;
use sc_cli::Error;
use std::path::PathBuf;
use structopt::StructOpt;
use substrate_bip39::mini_secret_from_entropy;
use bip39::{Mnemonic, Language, MnemonicType};
use sp_core::{sr25519, ed25519};
use sp_runtime::traits::{IdentifyAccount};
use libp2p::identity::{ed25519 as libp2p_ed25519, PublicKey};
use crate::{network_describe_config, network_config, chain_spec:: { AccountPublic, get_public_from_seed }};

#[derive(Debug, StructOpt)]
pub struct NetworkConfigCmd {
    #[structopt(short, long, parse(from_os_str), default_value = "develop.yaml")]
    input: PathBuf,

    #[structopt(short, long, parse(from_os_str))]
    output: PathBuf,
}

impl NetworkConfigCmd {
    fn generate_node_key(&self) -> (String, String, String) {
        let keypair = libp2p_ed25519::Keypair::generate();
        let node_key = hex::encode(keypair.secret().as_ref());
        let peer_id_info = PublicKey::Ed25519(keypair.public()).into_peer_id();
        let peer_id = peer_id_info.to_base58();
        let peer_id_hex = hex::encode(bs58::decode(peer_id.clone()).into_vec().unwrap());
        (peer_id, peer_id_hex, node_key)
    }

    fn generate_peer_secret(&self) -> network_config::Secret {
        let words = MnemonicType::Words12;
        let mnemonic = Mnemonic::new(words, Language::English);
        let phrase: &str = mnemonic.phrase();
        let mnemonic = Mnemonic::from_phrase(phrase, Language::English).unwrap();
        let mini_secret = mini_secret_from_entropy(mnemonic.entropy(), "")
            .unwrap();
        let seed = hex::encode(mini_secret.as_bytes());
        let sr25519_public = AccountPublic::from(get_public_from_seed::<sr25519::Public>(&seed));
        let ed25519_public = AccountPublic::from(get_public_from_seed::<ed25519::Public>(&seed));
        network_config::Secret {
            seed,
            phrase: phrase.to_string(),
            sr25519_public_key: hex::encode(sr25519_public.as_ref()),
            sr25519_ss58_address: sr25519_public.into_account().to_string(),
            ed25519_public_key: hex::encode(ed25519_public.as_ref()),
            ed25519_ss58_address: ed25519_public.into_account().to_string(),
        }
    }

    pub fn run(&self) -> Result<(), Error> {
        println!("Parsing network configurations");
        let contents =  fs::read_to_string(self.input.as_path())
            .expect("Can't load network describe configurations");
        let network_describe_config: network_describe_config::Network = serde_yaml::from_str(&contents).unwrap();
        let mut peers: Vec<network_config::Peer> = vec![];
        for group in &network_describe_config.groups {
            for peer in &group.peers {
                let (peer_id, peer_id_hex, node_key) = self.generate_node_key();
                peers.push( network_config::Peer {
                    name: peer.name.clone(),
                    group: group.name.clone(),
                    is_root: peer.is_root,
                    is_group_main: peer.is_group_main,
                    ip: peer.ip.clone(),
                    port: peer.port,
                    ws_port: peer.ws_port,
                    rpc_port: peer.rpc_port,
                    secret: self.generate_peer_secret(),
                    node_key,
                    peer_id,
                    peer_id_hex,
                });
            }
        }
        let network_config = network_config::Network {
            name: network_describe_config.name.clone(),
            id: network_describe_config.id.clone(),
            peers,
        };
        let network_config= serde_yaml::to_string(&network_config).unwrap();
        fs::write(self.output.as_path(), network_config).unwrap();
        Ok(())
    }
}
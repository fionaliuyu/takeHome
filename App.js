import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import { React, useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false"

const db = SQLite.openDatabase('MainDB');

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignSelf: "stretch",
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  view1: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  view2: {
    flex: 4,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  body2: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: "stretch",
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  view3: {
    flex: 7,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  title_text: {
    fontSize: 25,
    fontWeight: 'bold',
    margin: 5,
    marginLeft: 10,
    alignItems: 'stretch',
  },
  subtitle_text: {
    width: 115,
    fontSize: 20,
    fontStyle: 'bold',
    marginBottom: 8,
    marginTop: 3,
    marginLeft: 10,
  },
  asset_text: {
    width: 115,
    fontSize: 17,
    fontStyle: 'bold',
    marginBottom: 8,
    marginTop: 3,
    marginLeft: 10,
  },
  button_text: {
    color: '#000000',
    fontSize: 17,
    fontStyle: 'bold',
    textAlign: 'center',
    margin: 7,
  },
  button: {
    width: 70,
    height: 30,
    alignItems: 'flex-start',
    borderRadius: 5,
    margin: 10,
    borderBottomColor: '#555',
  },
  input: {
    alignSelf: "stretch",
    borderWidth: 2,
    borderColor: '#555',
    borderRadius: 5,
    backgroundColor: '#ffffff',
    textAlign: 'flex-start',
    fontSize: 20,
    marginBottom: 10,
    marginTop: 3,
    marginLeft: 10,
  },
  dropdown: {
    alignSelf: "stretch",
    borderColor: "#555",
    height: 20,
    width: 200,
    margin: 10,
  },
  assetAbbrText: {
    width: 230,
    fontSize: 13,
    marginTop: 1,
    margin: 10,
  },
  assetHoldingAbbrText: {
    fontSize: 13,
    marginTop: 1,
    margin: 10,
  },
});

export default function App() {

  // Setting up the initial states using
  // react hook 'useState'
  const [asset, setAsset] = useState("");
  const [quantity, setQuantity] = useState();
  const [price, setPrice] = useState();
  const [balance, setBalance] = useState(0);
  const [assetOpen, setAssetOpen] = useState(false);
  const [assetSelection, setAssetSelection] = useState([
    { label: 'BTC', value: 'Bitcoin' },
    { label: 'ETH', value: 'Ethereum' },
    { label: 'ADA', value: 'Cardano' },
    { label: 'SOL', value: 'Solana' },
    { label: 'DOT', value: 'Polkadot' },
  ]);

  const [assetItems, setAssetItems] = useState(new Map());

  const [assetItems_lst, setAssetItems_lst] = useState([]);

  const [assetPrices, setAssetPrices] = useState(new Map());

  const [crypto, setCrypto] = useState([]);

  // Fetching crypto data from the API 
  const getPrice = () => {
    // Passing configuration object to axios
    axios({
      method: 'get',
      url: API_URL,
    }).then((response) => {
      setCrypto(response.data);

      for (let i = 0; i < crypto.length; i++) {
        setAssetPrices(assetPrices.set(crypto[i].name, parseInt(crypto[i].current_price).toFixed(2)));
      }
      console.log("assetPrices  = ", assetPrices);

    });
  };

  const assetName = {
    "Bitcoin": "BTC",
    "Ethereum": "ETH",
    "Cardano": "ADA",
    "Solana": "SOL",
    "Polkadot": "DOT",
  };

  const deleteTable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "DROP TABLE Portfolio"
      )
    })
    console.log("table deleted successfully");
  }

  const createTable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS "
        + "Portfolio "
        + "(ID INTEGER PRIMARY KEY AUTOINCREMENT, Asset TEXT, Quantity INTEGER, Price INTEGER);"
      )
    })
    console.log("table created successfully");
  }


  useEffect(() => {
    createTable();
    getPrice();

  }, []);

  const getData = () => {
    try {
      var tmpBalance = 0;
      setAssetItems(new Map());
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT Asset, Quantity, Price FROM Portfolio",
          [],
          (tx, results) => {
            var len = results.rows.length;
            if (len > 0) {
              for (let i = 0; i < len; i++) {
                var currAsset = results.rows.item(i).Asset;
                var currQuantity = results.rows.item(i).Quantity;
                var currPrice = results.rows.item(i).Price;
                tmpBalance += currQuantity * assetPrices.get(currAsset);

              }
              setBalance(tmpBalance);
              console.log("setBalance balance = ", tmpBalance.toFixed(2));
            }
          }
        )
      })
    } catch (error) {
      console.log(error);
    }
  }

  const setData = async () => {
    if (quantity == 0 || price == 0) {
      Alert.alert('Warning!', 'Please write your data.')
    }
    else if (isNaN(price) || isNaN(quantity)) {
      Alert.alert('Warning!', 'Please enter numeric price and quantity.')
    }
    else if (asset.length == 0) {
      Alert.alert('Warning!', 'Please select an asset.')
    }
    else {
      try {
        Alert.alert('Confirmed!', 'Add new Asset "' + asset + '" with quantity of ' + quantity + " at price $" + price);
        await db.transaction(async (tx) => {
          await tx.executeSql(
            "INSERT INTO Portfolio (Asset, Quantity, Price) VALUES (?,?,?)",
            [asset, quantity, price]
          );

        })

        if (assetItems && assetItems.has(asset)) {
          setAssetItems(assetItems.set(asset, assetItems.get(asset) + quantity));
        }
        else { setAssetItems(assetItems.set(asset, quantity)); }

        if (assetPrices.length != "undefined") {
          var tmpBalance = 0;

          setAssetItems_lst(Array.from(assetItems, ([k, v]) => {
            tmpBalance += v * assetPrices.get(k);
            return { name: k, asset_quantity: v, asset_price: assetPrices.get(k) };
          }));
          setBalance(tmpBalance);
        }
        console.log("assetItems_lst  = ", assetItems_lst);

        setPrice(0);
        setQuantity(0);
        setAsset('');
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.view1}>
        <Text style={styles.title_text}>Current Balance</Text>
        <Text style={styles.subtitle_text}>US ${balance}</Text>
      </View>

      <View style={styles.view2}>
        <Text style={styles.title_text}>Your Assets</Text>
        <View style={styles.body}>
          <View style={styles.view1}>
            <View style={styles.body2}>
              <View style={styles.view2}>
                <Text style={styles.subtitle_text}>Asset</Text>
              </View>
              <View style={styles.view2}>
                <Text style={styles.subtitle_text}>Price</Text>
              </View>
              <View style={styles.view2}>
                <Text style={styles.subtitle_text}>Holding</Text>
              </View>
            </View>
          </View>
          <View style={styles.view3}>
            <ScrollView style={{ flexDirection: 'column' }}>
              {
                assetItems_lst.map((object) => {
                  return (
                    <View>
                      <View style={{
                        flexDirection: 'row', alignSelf: "stretch",
                        alignItems: 'stretch', flex: 1
                      }} key={object.name}>

                        <Text style={styles.asset_text}>{object.name}</Text>
                        <Text style={styles.asset_text}>{object.asset_price}</Text>
                        <Text style={styles.asset_text}>${balance}</Text>
                      </View>

                      <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.assetAbbrText}>{assetName[object.name]}</Text>
                        <Text style={styles.assetHoldingAbbrText}>{object.asset_quantity + " " + object.name}</Text>

                      </View>
                    </View>
                  )
                })}
            </ScrollView>
          </View>
        </View >
      </View >

      <View style={styles.view2}>
        <Text style={styles.title_text}>Add Assets</Text>
        <View style={styles.body}>
          <View style={styles.view1}>
            <Text style={styles.subtitle_text}>Asset</Text>
            <View style={styles.dropdown}>
              <DropDownPicker
                defaultNull
                searchable={true}
                searchPlaceholder="Search your asset here..."
                searchablePlaceholderTextColor="gray"
                searchableError={() => <Text>Not Found</Text>}
                open={assetOpen}
                value={asset ? asset : ""}
                items={assetSelection}
                setOpen={setAssetOpen}
                setValue={setAsset}
                setItems={setAssetSelection}
                multiple={false}
                itemStyle={{
                  justifyContent: 'flex-start',
                  flexDirection: 'column'
                }}
                dropDownStyle={{ backgroundColor: '#fafafa' }}
                dropDownDirection="TOP"
                style={{
                  backgroundColor: '#fafafa', borderColor: "#B7B7B7",
                  height: 10, fontsize: 20, justifyContent: "center", alignItems: 'center',
                }}
                placeholder="Select an Asset"
                containerStyle={{ height: 10, width: 200, justifyContent: 'center', }}
                placeholderstyle={styles.input}

                onChangeItem={(item) => setAsset(item.value)}
              />
            </View>
          </View>
          <View style={styles.view1}>
            <Text style={styles.subtitle_text}>Quantity</Text>
            <TextInput
              value={quantity ? quantity : ""}
              style={styles.input}
              placeholder='Enter the Asset Quantity '
              onChangeText={(value) => setQuantity(parseInt(value))}
            />
          </View>
          <View style={styles.view1}>
            <Text style={styles.subtitle_text}>Price ($)</Text>
            <TextInput
              value={price ? price : ""}
              style={styles.input}
              placeholder='Enter the Asset Price '
              onChangeText={(value) => setPrice(parseInt(value))}
            />
          </View>
        </View>
      </View>

      <View style={styles.view1}>
        <Pressable
          onPress={() => {
            setData();
          }}
          hitSlop={{ top: 20, bottom: 20, right: 20, left: 20 }}
          style={({ pressed }) => [
            { backgroundColor: pressed ? '#dddddd' : '#00ff00' },
            styles.button
          ]}

        >
          <Text style={styles.button_text}>Submit</Text>
        </Pressable>
      </View>
    </SafeAreaView >
  );
}



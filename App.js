import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, utton, TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable, TextInput, SafeAreaView, Alert
} from 'react-native';
import React, { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('MainDB');

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#0000ff',
    alignSelf: "stretch",
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  view1: {
    flex: 3,
    backgroundColor: '#00ffff',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  view2: {
    flex: 6,
    backgroundColor: '#ff00ff',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  body2: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: "stretch",
    backgroundColor: '#00ffff',
  },
  view3: {
    flex: 9,
    backgroundColor: '#ffff00',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  view4: {
    flex: 1,
    backgroundColor: '#ffff00',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  title_text: {
    color: '#000000',
    fontSize: 30,
    fontStyle: 'bold',
    margin: 15,
    alignItems: 'stretch',
  },
  subtitle_text: {
    color: '#000000',
    fontSize: 25,
    fontStyle: 'bold',
    margin: 15,
  },
  button_text: {
    color: '#000000',
    fontSize: 20,
    fontStyle: 'bold',
    textAlign: 'center',
    margin: 5,
  },
  button: {
    width: 70,
    height: 30,
    alignItems: 'flex-start',
    borderRadius: 5,
    margin: 5,
    borderBottomColor: '#555',
  },
  input: {
    width: 300,
    borderWidth: 2,
    borderColor: '#555',
    borderRadius: 5,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 10,
  }
});

export default function App() {
  // const [submitted, SetSubmitted] = useState(false);
  // const onPressHandler = () => {
  //   SetSubmitted(!submitted);
  // }

  const [asset, setAsset] = useState('');
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    deleteTable();
    createTable();
    getData();
  }, []);

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

  const getData = () => {
    try {
      var tmpBalance = 0;

      db.transaction((tx) => {
        tx.executeSql(
          "SELECT Asset, Quantity, Price FROM Portfolio",
          [],
          (tx, results) => {
            var len = results.rows.length;
            if (len > 0) {
              for (let i = 0; i < len; i++) {
                var userQuantity = results.rows.item(i).Quantity;
                console.log("Quantity = ", userQuantity);
                var userPrice = results.rows.item(i).Price;
                console.log("userPrice = ", userPrice);
                tmpBalance += userQuantity * userPrice;
                console.log("tmpBalance = ", tmpBalance);
              }
              setBalance(tmpBalance);
              console.log("setBalance tmpBalance = ", tmpBalance);
              console.log("setBalance balance = ", balance);
            }
          }
        )
      })



    } catch (error) {
      console.log(error);
    }
  }

  const setData = () => {
    if (quantity.length == 0 || price.length == 0 || asset.length == 0) {
      Alert.alert('Warning!', 'Please write your data.')
    } else {
      try {
        Alert.alert('Confirmed!', 'Add new Asset "' + asset + '" with Quantity of ' + quantity + " in Price of " + price);
        db.transaction((tx) => {
          tx.executeSql(
            "INSERT INTO Portfolio (Asset, Quantity, Price) VALUES (?,?,?)",
            [asset, parseInt(quantity), parseInt(price)]
          );

        })
        getData();
      } catch (error) {
        console.log(error);
      }
    }
  }



  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.view1}>
        <Text style={styles.title_text}>Current Balance</Text>
        <Text style={styles.title_text}>US ${balance}</Text>
      </View>

      <View style={styles.view2}>
        <Text style={styles.title_text}>Your Assets</Text>
        <View style={styles.body2}>
          <View style={styles.view3}>
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
        <Text style={styles.title_text}>Add Assets</Text>
        <View style={styles.body}>
          <View style={styles.view1}>
            <Text style={styles.subtitle_text}>Asset</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter your Asset '
              onChangeText={(value) => setAsset(value)}
            />
          </View>
          <View style={styles.view1}>
            <Text style={styles.subtitle_text}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter the Asset Quantity '
              onChangeText={(value) => setQuantity(value)}
            />
          </View>
          <View style={styles.view1}>
            <Text style={styles.subtitle_text}>Price ($)</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter the Asset Price '
              onChangeText={(value) => setPrice(value)}
            />
          </View>
        </View>
      </View>

      <View style={styles.view4}>
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
    </SafeAreaView>
  );
}



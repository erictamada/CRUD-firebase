// CRUD PARA A FUNCIONALIDADE DO CARRINHO

import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, Button, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';

import * as firebase from 'firebase';
import 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCMokqlcUlpBhJy85X6moNnm9ec3KKK_fg',
  authDomain: 'sprint4-12e3c.appspot.com',
  databaseURL: 'https://sprint4-12e3c-default-rtdb.firebaseio.com',
  projectId: 'sprint4-12e3c',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default function App() {
  const [carrinho, setCarrinho] = useState([]);
  const [produto, setProduto] = useState({ nome: '', preco: '', quantidade: '' });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Ler itens
  useEffect(() => {
    const carrinhoRef = firebase.database().ref('carrinho');
    carrinhoRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setCarrinho(items);
      }
    });
  }, []);

  // Adicionar item
  const adicionarAoCarrinho = () => {
    if (!produto.nome || !produto.preco || !produto.quantidade) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    setCarregando(true);
    setErro(null);

    const carrinhoRef = firebase.database().ref('carrinho');
    const novoProduto = carrinhoRef.push();
    novoProduto.set(produto, (error) => {
      setCarregando(false);
      if (error) {
        setErro('Erro ao adicionar produto: ' + error.message);
        Alert.alert('Erro', 'Erro ao adicionar produto.');
      } else {
        console.log('Produto adicionado ao carrinho:', produto.nome);
        setProduto({ nome: '', preco: '', quantidade: '1' });
      }
    });
  };

  // Atualizar quantidade
  const atualizarQuantidade = (id, novaQuantidade) => {
    if (!novaQuantidade) {
      Alert.alert('Erro', 'A quantidade não pode estar vazia.');
      return;
    }

    setCarregando(true);
    setErro(null);

    const carrinhoRef = firebase.database().ref(`carrinho/${id}`);
    carrinhoRef.update({ quantidade: novaQuantidade }, (error) => {
      setCarregando(false);
      if (error) {
        setErro('Erro ao atualizar produto: ' + error.message);
        Alert.alert('Erro', 'Erro ao atualizar produto.');
      } else {
        console.log('Quantidade atualizada para o produto:', id);
      }
    });
  };

  // Remover item
  const removerDoCarrinho = (id) => {
    setCarregando(true);
    setErro(null);

    const carrinhoRef = firebase.database().ref(`carrinho/${id}`);
    carrinhoRef.remove((error) => {
      setCarregando(false);
      if (error) {
        setErro('Erro ao remover produto: ' + error.message);
        Alert.alert('Erro', 'Erro ao remover produto.');
      } else {
        console.log('Produto removido do carrinho:', id);
      }
    });
  };

  const tentarNovamente = () => {
    setErro(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>{item.nome}</Text>
      <Text>Preco: {item.preco}</Text>
      <Text>Quantidade: {item.quantidade}</Text>
      <TouchableOpacity style={styles.button} onPress={() => removerDoCarrinho(item.id)}>
        <Text style={styles.buttonText}>Remover</Text>
      </TouchableOpacity>
      <TextInput
        placeholder="Quantidade"
        keyboardType="numerico"
        value={item.quantidade}
        onChangeText={(text) => atualizarQuantidade(item.id, text)}
        style={styles.input}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KITE</Text>
      {carregando && <ActivityIndicator size="large" color="#0000ff" />}
      <TextInput
        placeholder="Nome do produto"
        onChangeText={(text) => setProduto({ ...produto, nome: text })}
        value={produto.nome}
        style={styles.input}
      />
      <TextInput
        placeholder="Preço do produto"
        keyboardType="numeric"
        onChangeText={(text) => setProduto({ ...produto, preco: text })}
        value={produto.preco}
        style={styles.input}
      />
      <TextInput
        placeholder="Quantidade"
        keyboardType="numeric"
        onChangeText={(text) => setProduto({ ...produto, quantidade: text })}
        value={produto.quantidade}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={adicionarAoCarrinho}>
        <Text style={styles.buttonText}>Adicionar ao Carrinho</Text>
      </TouchableOpacity>
      {erro && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity style={styles.button} onPress={tentarNovamente}>
            <Text style={styles.buttonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={carrinho}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  item: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    marginVertical: 10,
  },
  errorContainer: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: '#fdd',
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  title:{
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 30,
    color: '#D4BF96',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: '0px',
  },
  button: {
    backgroundColor: '#D4BF96',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});
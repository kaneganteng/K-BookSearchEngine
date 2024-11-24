import './App.css';
import { Outlet } from 'react-router-dom';

import Navbar from './components/Navbar';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client';
// import { setContext } from '@apollo/client/link/context';

// Construct main GraphQL API endpoint
const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;

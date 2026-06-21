import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { store } from './src/redux/store';
import LoadingScreen from './src/screens/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import TermsAndConditionsScreen from './src/screens/TermsAndConditionsScreen';
import HomeScreen from './src/screens/HomeScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import MetricsScreen from './src/screens/MetricsScreen';
import AuctionListScreen from './src/screens/AuctionListScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import BidScreen from './src/screens/BidScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import { AppThemeProvider, useAppTheme } from './src/theme/AppTheme';
import MisPropuestasScreen from './src/screens/MisPropuestasScreen';
import ProponerProductoScreen from './src/screens/ProponerProductoScreen';
import AgregarMetodoPagoScreen from './src/screens/AgregarMetodoPagoScreen';
import MetodosDePagoScreen from './src/screens/MetodosPagoScreen';
import FinalizarCompraScreen from './src/screens/FinalizarCompraScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { navigationTheme, colors } = useAppTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro', headerShown: false }} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Generar Nueva Contraseña',headerShown: false }} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={{ title: 'Terminos y Condiciones', headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio', headerShown: false }} />
        <Stack.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Catalogo', headerShown: false }} />
        <Stack.Screen name="Metrics" component={MetricsScreen} options={{ title: 'Métricas de Subastas', headerShown: false }} />
        <Stack.Screen name="Auctions" component={AuctionListScreen} options={{ title: 'Subastas', headerShown: false }} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Detalle', headerShown: false }} />
        <Stack.Screen name="Bid" component={BidScreen} options={{ title: 'Pujar',headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ProponerProducto" component={ProponerProductoScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="MisPropuestas" component={MisPropuestasScreen} options={{ title: 'Mis Propuestas', headerShown: false}} />
        <Stack.Screen name="AgregarMetodoPago" component={AgregarMetodoPagoScreen} options={{ title: 'Agregar Método de Pago', headerShown: false}} />
        <Stack.Screen name="MetodosDePago" component={MetodosDePagoScreen} options={{ title: 'Métodos de Pago', headerShown: false}} />
        <Stack.Screen name="FinalizarCompra" component={FinalizarCompraScreen} options={{ title: 'Resumen de Compra/Devolución', headerShown: false}} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 1400);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AppThemeProvider>
      <Provider store={store}>{isReady ? <RootNavigator /> : <LoadingScreen />}</Provider>
    </AppThemeProvider>
  );
}

import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/Navigation';
import { InventoryManagerScreen, MarketplaceScreen } from './components/Marketplace';
import ContactScreen from './components/Contact';
import NotificationsScreen from './components/Notifications';
import CartScreen from './components/Cart';
import { Checkout, CheckoutSuccess } from './components/Checkout';
import AddFarmScreen from './components/AddFarm';

export default function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Switch>
          <Route path="/" exact component={InventoryManagerScreen} />
          <Route path="/marketplace" exact component={MarketplaceScreen} />
          <Route path="/contact" exact component={ContactScreen} />
          <Route path="/notifications" exact component={NotificationsScreen} />
          <Route path="/profile" exact component={AddFarmScreen} />
          <Route path="/cart" exact component={CartScreen} />

          <Route path="/cart/checkout" exact component={Checkout} />
          <Route path="/cart/success" exact component={CheckoutSuccess} />
        </Switch>
        <Footer />
      </Router>
    </div>
  );
}

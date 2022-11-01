import { appDidStart$ } from '@shopgate/engage/core';
import { variantDidChange$ } from '@shopgate/pwa-common-commerce/product/streams';
import { productIsReady$ } from '@shopgate/pwa-tracking/streams/product';
import {
  userDataReceived$,
  userDidLogout$,
  getUserData,
} from '@shopgate/engage/user';
import { getProductFormated } from './selectors';
import getRetailRed from './retailRedStorefront';

export default (subscribe) => {
  // Include storefront library
  subscribe(appDidStart$, () => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://cdn.retail.red/omni/retailred-storefront-library-v2.js';
    const parent = document.getElementsByTagName('head')[0];
    parent.appendChild(script);
  });

  // Update user data with logged in user
  subscribe(userDataReceived$, ({ getState }) => {
    const state = getState();
    const userData = getUserData(state);

    const user = userData ? {
      code: null,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      emailAddress: userData.mail,
    } : {};

    getRetailRed().updateConfig({
      customer: user,
    });
  });

  // Unset user after logout
  subscribe(userDidLogout$, () => {
    const user = {
      code: null,
      firstName: '',
      lastName: '',
      phone: '',
      emailAddress: '',
    };
    getRetailRed().updateConfig({
      customer: user,
    });
  });

  // Update product data
  subscribe(productIsReady$, ({ getState, action }) => {
    const state = getState();
    const {
      id: productId,
    } = action.productData;

    const props = { productId };

    const formatedProduct = getProductFormated(state, props);

    getRetailRed().updateConfig({
      product: formatedProduct,
    });
  });

  // Update product data after variant change
  subscribe(variantDidChange$, ({ getState, action }) => {
    const state = getState();
    const {
      id: productId,
    } = action.productData;
    const props = { productId };

    const formatedProduct = getProductFormated(state, props);

    getRetailRed().updateConfig({
      product: formatedProduct,
    });
  });
};

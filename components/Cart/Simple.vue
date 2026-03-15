<template>
  <div
    class="bg-colorBgLight dark:bg-colorBgDark farm-grain-bg farm-checkout-shell"
  >
    <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-12 lg:px-8">
      <div class="mt-12" v-if="launchStep == '' || displaymode == true">
        <h1 class="text-3xl font-bold tracking-tight farm-title">
          {{ t("Shopcart") }}
        </h1>

        <div>
          <h2 class="sr-only">Items in your shopping cart</h2>

          <ul
            role="list"
            class="divide-y divide-gray-200 border-b border-t border-gray-200"
          >
            <li
              v-for="(product, productIdx) in cartItems"
              :key="product.id"
              class="flex py-6 sm:py-10"
            >
              <div class="flex-shrink-0">
                <img
                  :src="product.image"
                  :alt="product.image"
                  class="h-24 w-24 rounded-lg object-cover object-center sm:h-32 sm:w-32"
                />
              </div>

              <div
                class="relative ml-4 flex flex-1 flex-col justify-between sm:ml-6"
              >
                <div>
                  <div class="flex justify-between sm:grid sm:grid-cols-2">
                    <div class="pr-6">
                      <h3 class="text-sm">
                        <a
                          :href="product.href"
                          class="font-medium text-2xl text-gray-700 hover:text-gray-800 dark:text-white"
                          >{{ product.title }}</a
                        >
                      </h3>
                    </div>

                    <p
                      v-if="filtersList == 'Bitcoin'"
                      class="text-right text-lg font-medium text-gray-900 dark:text-white"
                    >
                      {{ (product.price * btcprices).toFixed(8) }}
                      <BitcoinIcon
                        class="h-6 w-6 inline -mt-1"
                        aria-hidden="true"
                      />
                    </p>

                    <p
                      v-if="filtersList == 'Sats'"
                      class="text-right text-lg font-medium text-gray-900 dark:text-white"
                    >
                      {{ (product.price * btcprices * 100000000).toFixed(0) }}
                      <SatoshiV2Icon
                        class="h-6 w-6 inline -mt-1"
                        aria-hidden="true"
                      />
                    </p>

                    <p
                      v-if="filtersList == 'Fiat'"
                      class="text-right text-xl font-medium text-gray-900 dark:text-white"
                    >
                      {{ product.price }} {{ ticker.fiat.symbol }}
                    </p>
                  </div>

                  <div
                    class="mt-4 flex items-center sm:absolute sm:left-1/2 sm:top-0 sm:mt-0 sm:block"
                  >
                    <label
                      :for="`quantity-${productIdx}`"
                      class="block max-w-full py-1.5 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:text-white"
                      >{{ t("Quantity") }}: {{ product.amount }}</label
                    >

                    <button
                      @click="removeFromCart((id = product.id))"
                      class="ml-4 text-sm font-medium farm-remove-link sm:ml-0 sm:mt-3"
                    >
                      <span>{{ t("Remove") }}</span>
                    </button>
                  </div>
                </div>

                <!-- <p class="mt-4 flex space-x-2 text-sm text-gray-700">
                    <CheckIcon v-if="product.inStock" class="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                    <ClockIcon v-else class="h-5 w-5 flex-shrink-0 text-gray-300" aria-hidden="true" />
                    <span class=" dark:text-white">{{ product.inStock ? 'In stock' : `Ships in <5 days` }}</span>
                  </p> -->
              </div>
            </li>
          </ul>
        </div>

        <!-- Order summary -->
        <div class="mt-10">
          <div class="farm-checkout-card px-4 py-6 sm:p-6 lg:p-8">
            <h2 class="sr-only">Order summary</h2>

            <div class="flow-root">
              <dl class="-my-4 divide-y divide-gray-200 text-sm">
                <div class="flex items-center justify-between py-4">
                  <dt class="text-base font-medium text-gray-900">
                    {{ t("Ordertotal") }}
                  </dt>
                  <!-- <dd class="text-base font-medium text-gray-900">{{ totalPrice }} $</dd> -->

                  <dd
                    v-if="filtersList == 'Bitcoin'"
                    class="text-right text-xl font-medium text-gray-900"
                  >
                    {{ (totalPrice * btcprices).toFixed(8) }}
                    <BitcoinIcon
                      class="h-6 w-6 inline -mt-2"
                      aria-hidden="true"
                    />
                  </dd>

                  <dd
                    v-if="filtersList == 'Sats'"
                    class="text-right text-xl font-medium text-gray-900"
                  >
                    {{ (totalPrice * btcprices * 100000000).toFixed(0) }}
                    <SatoshiV2Icon
                      class="h-6 w-6 inline -mt-2"
                      aria-hidden="true"
                    />
                  </dd>

                  <dd
                    v-if="filtersList == 'Fiat'"
                    class="text-right text-xl font-medium text-gray-900"
                  >
                    {{ totalPrice }} {{ ticker.fiat.symbol }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- SHIPPING INFO -->

          <div
            class="px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:py-16 mt-4 farm-checkout-section"
          >
            <div class="max-w-xl">
              <p class="mt-2 text-4xl font-bold tracking-tight">
                {{ t("ShippingAddress") }}
              </p>

              <!-- <dl class="mt-12 text-sm font-medium">
        <dt class="text-gray-900">Tracking number</dt>
        <dd class="mt-2 text-indigo-600">51547878755545848512</dd>
      </dl> -->
            </div>

            <section aria-labelledby="shipping-heading" class="mt-10">
              <h2
                id="shipping-heading"
                class="text-lg font-medium text-gray-900 dark:text-white"
              ></h2>

              <div class="rounded-md bg-red-50 p-4" v-if="missingInfo == true">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">
                      The shipping information is missing some input! 👀
                    </h3>
                    <div class="mt-2 text-sm text-red-700">
                      <ul role="list" class="list-disc space-y-1 pl-5">
                        <li>
                          Please make sure the following fields are correctly
                          filled in.
                        </li>
                        <li>
                          First & Last name, Emailaddress and Geographic Address
                          🌎
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-4">
                <div class="sm:col-span-2">
                  <label
                    for="firstname"
                    class="block text-sm font-medium text-gray-700 dark:text-white"
                    >{{ t("FirstName") }}</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      v-model="firstname"
                      id="firstname"
                      name="firstname"
                      autocomplete="firstname"
                      class="block w-full sm:text-sm farm-input"
                    />
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="lastname"
                    class="block text-sm font-medium text-gray-700 dark:text-white"
                    >{{ t("LastName") }}</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      v-model="lastname"
                      id="lastname"
                      name="lastname"
                      autocomplete="lastname"
                      class="block w-full sm:text-sm farm-input"
                    />
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="company"
                    class="block text-sm font-medium text-gray-700 dark:text-white"
                    >{{ t("Company") }}</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      v-model="company"
                      id="company"
                      name="company"
                      autocomplete="comapany"
                      class="block w-full sm:text-sm farm-input"
                    />
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="email"
                    class="block text-sm font-medium text-gray-700 dark:text-white"
                    >Email</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      v-model="email"
                      id="email"
                      name="email"
                      autocomplete="email"
                      class="block w-full sm:text-sm farm-input"
                    />
                  </div>
                </div>

                <div class="sm:col-span-4">
                  <label
                    for="address"
                    class="block text-sm font-medium text-gray-700 dark:text-white"
                    >{{ t("Address") }}</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      v-model="address"
                      id="address"
                      name="address"
                      autocomplete="street-address"
                      class="block w-full sm:text-sm farm-input"
                    />
                  </div>
                </div>

                <div class="sm:col-span-4">
                  <label
                    for="apartment"
                    class="block text-sm font-medium text-gray-700 dark:text-white"
                    >{{ t("Addition") }}</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      v-model="apartment"
                      id="apartment"
                      name="apartment"
                      class="block w-full sm:text-sm farm-input"
                    />
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="city"
                    class="block text-sm font-medium text-gray-700 dark:text-white"
                    >{{ t("City") }}</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      v-model="city"
                      id="city"
                      name="city"
                      autocomplete="address-level2"
                      class="block w-full sm:text-sm farm-input"
                    />
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="postal-code"
                    class="block text-sm font-medium text-gray-700 dark:text-white"
                    >{{ t("Postcode") }}</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      v-model="postalcode"
                      id="postal-code"
                      name="postal-code"
                      autocomplete="postal-code"
                      class="block w-full sm:text-sm farm-input"
                    />
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="region"
                    class="block text-sm font-medium text-gray-700 dark:text-white"
                    >{{ t("StateProvince") }}</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      v-model="region"
                      id="region"
                      name="region"
                      autocomplete="address-level1"
                      class="block w-full sm:text-sm farm-input"
                    />
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="country"
                    class="block text-sm font-medium text-gray-700 dark:text-white"
                    >{{ t("Country") }}</label
                  >
                  <div class="mt-1">
                    <input
                      type="text"
                      v-model="country"
                      id="country"
                      name="country"
                      autocomplete="country"
                      class="block w-full sm:text-sm farm-input"
                    />
                  </div>
                </div>
              </div>
            </section>

            <!-- END SHIPPING INFO -->

            <div class="mt-10">
              <button
                @click="orderView()"
                class="w-full px-4 py-3 text-base font-medium text-white farm-button-primary"
              >
                {{ t("ContinueOrder") }}
              </button>
            </div>
          </div>

          <div class="mt-6 text-center text-sm text-gray-500">
            <p>
              <NuxtLink
                :to="localePath('/shop')"
                class="font-medium farm-remove-link"
              >
                {{ t("ContinueShop") }}
                <span aria-hidden="true"> &rarr;</span>
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>

      <div>
        <Script async src="/BTCart-Checkout.js"></Script>
        <div class="mt-12"></div>
        <div class="" v-if="launchStep == 'view' || displaymode == true">
          <!-- ORDER OVERVIEW -->

          <div
            class="px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:py-16 rounded-3xl border-4 border-gray-600 mt-4"
          >
            <div class="mx-auto max-w-3xl">
              <div class="max-w-3xl">
                <h1 class="text-base font-medium farm-subtitle">
                  Thank you for concidering ordering stuff!
                </h1>
                <p class="mt-2 text-4xl font-bold tracking-tight">
                  Order Overview!
                </p>
                <p class="mt-2 text-base text-gray-500 dark:text-white">
                  Your order #{{ randomid }} please confirm all details updating
                  won't be possible.<br />
                  Take a screenshot of the order information and make sure your
                  payment mentions the order id!
                </p>

                <!-- <dl class="mt-12 text-sm font-medium">
        <dt class="text-gray-900">Tracking number</dt>
        <dd class="mt-2 text-indigo-600">51547878755545848512</dd>
      </dl> -->
              </div>

              <section
                aria-labelledby="order-heading"
                class="mt-10 border-t border-gray-200"
              >
                <h2 id="order-heading" class="sr-only">Your order</h2>

                <h3 class="sr-only">Items</h3>

                <ul
                  role="list"
                  class="divide-y divide-gray-200 border-b border-t border-gray-200"
                >
                  <li
                    v-for="(product, productIdx) in cartItems"
                    :key="product.id"
                    class="flex py-6 sm:py-10 border-b border-gray-200 py-10"
                  >
                    <div class="flex-shrink-0">
                      <img
                        :src="product.image"
                        :alt="product.image"
                        class="h-24 w-24 rounded-lg object-cover object-center sm:h-32 sm:w-32"
                      />
                    </div>

                    <div
                      class="relative ml-4 flex flex-1 flex-col justify-between sm:ml-6"
                    >
                      <div>
                        <div
                          class="flex justify-between sm:grid sm:grid-cols-2"
                        >
                          <div class="pr-6">
                            <h3 class="text-sm">
                              <a
                                :href="product.href"
                                class="font-medium text-2xl text-gray-700 hover:text-gray-800 dark:text-white"
                                >{{ product.title }}</a
                              >
                            </h3>
                          </div>

                          <p
                            v-if="filtersList == 'Bitcoin'"
                            class="text-right text-lg font-medium text-gray-900 dark:text-white"
                          >
                            {{ (product.price * btcprices).toFixed(8) }}
                            <BitcoinIcon
                              class="h-6 w-6 inline -mt-1"
                              aria-hidden="true"
                            />
                          </p>

                          <p
                            v-if="filtersList == 'Sats'"
                            class="text-right text-lg font-medium text-gray-900 dark:text-white"
                          >
                            {{
                              (product.price * btcprices * 100000000).toFixed(0)
                            }}
                            <SatoshiV2Icon
                              class="h-6 w-6 inline -mt-1"
                              aria-hidden="true"
                            />
                          </p>

                          <p
                            v-if="filtersList == 'Fiat'"
                            class="text-right text-xl font-medium text-gray-900 dark:text-white"
                          >
                            {{ product.price }} {{ ticker.fiat.symbol }}
                          </p>
                        </div>

                        <div
                          class="mt-4 flex items-center sm:absolute sm:left-1/2 sm:top-0 sm:mt-0 sm:block"
                        >
                          <label
                            :for="`quantity-${productIdx}`"
                            class="block max-w-full py-1.5 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:text-white"
                            >{{ t("Quantity") }}: {{ product.amount }}</label
                          >
                        </div>
                      </div>

                      <!-- <p class="mt-4 flex space-x-2 text-sm text-gray-700">
                    <CheckIcon v-if="product.inStock" class="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                    <ClockIcon v-else class="h-5 w-5 flex-shrink-0 text-gray-300" aria-hidden="true" />
                    <span class=" dark:text-white">{{ product.inStock ? 'In stock' : `Ships in <5 days` }}</span>
                  </p> -->
                    </div>
                  </li>
                </ul>

                <div class="">
                  <h3 class="sr-only">Your information</h3>

                  <h4 class="sr-only">Addresses</h4>
                  <dl class="grid grid-cols-2 gap-x-6 py-10 text-sm">
                    <div>
                      <dt class="font-medium text-gray-900 dark:text-white">
                        Shipping address
                      </dt>
                      <dd class="mt-2 text-gray-700 dark:text-white">
                        <address class="not-italic">
                          <span class="block">
                            {{ firstname }} {{ lastname }}</span
                          >
                          <span class="block">{{ company }} {{ email }} </span>
                          <span class="block"
                            >{{ address }} {{ apartment }}</span
                          >
                          <span class="block"
                            >{{ postalcode }} {{ city }}, {{ country }}
                            {{ region }}</span
                          >
                        </address>
                      </dd>
                    </div>
                    <div>
                      <dt class="font-medium text-gray-900 dark:text-white">
                        Shipping method
                      </dt>
                      <dd class="mt-2 text-gray-700 dark:text-white">
                        <address class="not-italic">
                          <span class="block">Free Global Shipping</span>
                          <span class="block"
                            >Order ships out up to 7 days
                          </span>
                          <span class="block"
                            >Delivery time: 5 working days</span
                          >
                        </address>
                      </dd>
                    </div>
                  </dl>

                  <h3 class="dark:text-white">Order information</h3>

                  <dl
                    class="space-y-6 border-t border-gray-200 dark:text-white pt-10 text-sm"
                  >
                    <div class="flex justify-between">
                      <dt class="font-medium text-gray-900 dark:text-white">
                        Timestamp
                      </dt>
                      <dd class="text-gray-700 dark:text-white">
                        {{ Date.now() }}
                      </dd>
                    </div>

                    <div class="flex justify-between">
                      <dt class="font-medium text-gray-900 dark:text-white">
                        Order ID
                      </dt>
                      <dd class="text-gray-700 dark:text-white">
                        #{{ randomid }}
                      </dd>
                    </div>

                    <div class="flex justify-between">
                      <dt class="font-medium text-gray-900 dark:text-white">
                        Current BTC Price
                      </dt>
                      <dd class="text-gray-700 dark:text-white">
                        {{ fiatToUsdRate.toFixed(2) }}
                        {{ ticker.fiat.symbol }}
                      </dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="font-medium text-gray-900 dark:text-white">
                        Total Bitcoin Price
                      </dt>
                      <dd class="text-gray-700 dark:text-white">
                        {{ (totalPrice * btcprices).toFixed(8) }}
                        <BitcoinIcon
                          class="h-6 w-6 inline -mt-1"
                          aria-hidden="true"
                        />
                      </dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="font-medium text-gray-900 dark:text-white">
                        Total Aproximate in Fiat
                      </dt>
                      <dd class="text-gray-900 dark:text-white">
                        {{ totalPrice.toFixed(2) }} {{ ticker.fiat.symbol }}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>
            </div>

            <div class="mt-10">
              <button
                @click="paymentstart()"
                class="w-full px-4 py-3 text-base font-medium text-white farm-button-primary"
              >
                {{ t("ContinuePay") }}
              </button>

              <p
                v-if="orderDispatchMessage"
                class="mt-3 farm-status-note"
                :class="
                  orderDispatchState === 'error'
                    ? 'farm-status-note--error'
                    : orderDispatchState === 'success'
                      ? orderDispatchMessage.includes('fallback')
                        ? 'farm-status-note--fallback'
                        : 'farm-status-note--success'
                      : 'farm-status-note--pending'
                "
              >
                {{ orderDispatchMessage }}
              </p>
            </div>
          </div>

          <!-- END ORDER OVERVIEW -->
        </div>

        <!-- START PAYMENT SECTION-->

        <div
          class="px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:py-16 rounded-3xl border-4 border-gray-600 mt-4"
          v-if="launchStep == 'payment' || displaymode == true"
        >
          <div class="max-w-3xl mb-12">
            <h1 class="text-base font-medium farm-subtitle">
              Choose your payment method to finish your order.
            </h1>
            <p class="mt-2 text-4xl font-bold tracking-tight">
              Thank you for ordering stuff 🎉!
            </p>

            <div class="border-l-4 border-yellow-400 bg-yellow-50 p-4 mt-6">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg
                    class="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-yellow-700">
                    Your order with id #{{ randomid }} has been registered, to
                    finish your order please continue by choosing onchain or
                    lightning payment. Once payment has been verified we will
                    ship your order as soon as possible.
                  </p>
                </div>
              </div>
            </div>

            <!-- <dl class="mt-12 text-sm font-medium">
      <dt class="text-gray-900">Tracking number</dt>
      <dd class="mt-2 text-indigo-600">51547878755545848512</dd>
    </dl> -->
          </div>

          <lightning-widget
            accent=""
            :to="data.lightningaddress"
            :addressbtc="data.btcadress"
            shippingpay="0.0000"
            :payamount="totalPriceBtc * 100000000000"
            :setpayamount="totalPriceBtc"
            products=""
            :onchain="data.lightningonly"
            :orderid="'Order: ' + randomid"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  BitcoinIcon,
  SatoshiV2Icon,
  NoDollarsIcon,
} from "@bitcoin-design/bitcoin-icons-vue/filled";

import { useFiltersStore } from "~/store/currency";
import { CheckIcon, ClockIcon } from "@heroicons/vue/20/solid";
import { useProjectStore } from "~/store/shopcart";
import { storeToRefs } from "pinia";
import data from "~/config/setup";
import {
  buildOrderMessage,
  dispatchOrderNotification,
} from "~/utils/orderDispatch";

import ticker from "~/config/setup";

const displaymode = ref(false);

const launchStep = ref("");

const randomid = ref("");

const cartStore = useProjectStore();
const { removeFromCart } = cartStore;
const { cartItems } = storeToRefs(cartStore);

// console.log(cartItems);

// SHIPPING SECTION

const firstname = ref("");
const lastname = ref("");
const company = ref("");
const email = ref("");
const address = ref("");
const apartment = ref("");
const city = ref("");
const postalcode = ref("");
const region = ref("");
const country = ref("");

const missingInfo = ref(false);

// END SHIPPING SECTION

const filtersStore = useFiltersStore();
const { filtersList } = storeToRefs(filtersStore);

const rates = await useBtcRates(ticker.fiat.denomination);
const btcprices = rates.btcPerFiat;
const fiatToUsdRate = rates.fiatToUsd;

const store = useProjectStore();
const getCartTotal = () => Number(store.getTotalPrice?.() ?? 0) || 0;
const calculateTotalPriceBtc = () => (getCartTotal() * btcprices).toFixed(8);

const totalPrice = ref(getCartTotal());
const orderDispatchState = ref("");
const orderDispatchMessage = ref("");

// const totalPriceSats = (totalPrice * btcprices * 100000000).toFixed(0);
const totalPriceBtc = ref(0);

function hasEmptyItem(array) {
  return array.some((item) => !item);
}

const myArray = ["apple", "", "banana"];

function orderView() {
  if (
    firstname.value == "" ||
    lastname.value == "" ||
    email.value == "" ||
    address.value == "" ||
    city.value == "" ||
    postalcode.value == "" ||
    country.value == ""
  ) {
    missingInfo.value = true;
    window.scrollTo(0, 0);
  } else {
    //Continue with
    launchStep.value = "view";
    totalPriceBtc.value = calculateTotalPriceBtc();

    window.scrollTo(0, 0);
  }
}

async function paymentstart() {
  launchStep.value = "payment";
  totalPriceBtc.value = calculateTotalPriceBtc();

  const orderMessage = buildOrderMessage({
    orderId: randomid.value,
    checkoutMode: "shipping",
    customer: {
      name: `${firstname.value} ${lastname.value}`.trim(),
      email: email.value,
      address: address.value,
      apartment: apartment.value,
      city: city.value,
      postalcode: postalcode.value,
      region: region.value,
      country: country.value,
      localidentity: "",
    },
    items: store.cartItems,
    totals: {
      subtotalFiat: Number(totalPrice.value || 0),
      shippingFiat: 0,
      totalFiat: Number(totalPrice.value || 0),
      totalBtc: Number(totalPriceBtc.value || 0),
      fiatCurrency: ticker.fiat.denomination,
      fiatSymbol: ticker.fiat.symbol,
    },
    timestamp: Date.now(),
  });

  try {
    orderDispatchState.value = "pending";
    orderDispatchMessage.value = "Sending order details to seller...";
    const delivery = await dispatchOrderNotification(orderMessage, data);
    orderDispatchState.value = "success";
    orderDispatchMessage.value = delivery.dmSent
      ? "Order sent to seller via Nostr DM."
      : "Order sent to seller via fallback webhook.";
    console.log(
      `Order dispatched: DM=${delivery.dmSent} webhook=${delivery.webhookSent} orderId=${randomid.value}`,
    );
  } catch (error) {
    orderDispatchState.value = "error";
    orderDispatchMessage.value = "Unable to confirm order delivery to seller.";
    console.error("Order dispatch failed", error);
  }

  window.scrollTo(0, 0);
}

const randomId = function (length = 6) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};

// Watch for changes in the cartItems array
watch(
  () => store.cartItems,
  () => {
    totalPrice.value = getCartTotal();
    // totalPriceBtc.value = (store.getTotalPrice() * btcprices).toFixed(8)
  },
  { deep: true },
);

// watch(() => store.cartItems, () => {
//   totalPriceBtc.value = (store.getTotalPrice() * btcprices).toFixed(8)
// }, { deep: true });

onMounted(() => {
  totalPrice.value = getCartTotal();
  // totalPriceBtc.value = (store.getTotalPrice() * btcprices).toFixed(8)
  randomid.value = randomId(10);
  // console.log(randomId(10));
});

const timenow = Date.now();

const formData = ref({
  firstname: firstname,
  lastname: lastname,
  company: company,
  email: email,
  address: address,
  apartment: apartment,
  city: city,
  postalcode: postalcode,
  region: region,
  country: country,
  orderid: randomid,
  totalprice: totalPrice.value,
  cartitems: store.cartItems,
  timestamp: timenow,

  // Add more fields as needed
});

const { t } = useI18n({ useScope: "local" });
</script>
<i18n lang="json">
{
  "da": {
    "Shopcart": "Indkøbsvogn",
    "Btcpayment": "Bitcoin Betalingsmetode",
    "Quantity": "Mængde",
    "Remove": "Fjern",
    "Ordertotal": "Ordre Total",
    "ContinueOrder": "Fortsæt til ordreoversigt",
    "ContinuePay": "Fortsæt til betaling",
    "ContinueShop": "Fortsæt med at handle",
    "ShippingAddress": "Forsendelsesadresse",
    "FirstName": "Fornavn",
    "LastName": "Efternavn",
    "Company": "Virksomhed",
    "Address": "Adresse",
    "Addition": "Lejlighed, suite, mv.",
    "City": "By",
    "Postcode": "Postnummer",
    "StateProvince": "Stat / Provins",
    "Country": "Land"
  },
  "de": {
    "Shopcart": "Einkaufswagen",
    "Btcpayment": "Bitcoin-Zahlungsmethode",
    "Quantity": "Menge",
    "Remove": "Entfernen",
    "Ordertotal": "Bestellsumme",
    "ContinueOrder": "Weiter zur Bestellübersicht",
    "ContinuePay": "Weiter zur Zahlung",
    "ContinueShop": "Weiter einkaufen",
    "ShippingAddress": "Lieferadresse",
    "FirstName": "Vorname",
    "LastName": "Nachname",
    "Company": "Firma",
    "Address": "Adresse",
    "Addition": "Wohnung, Suite, usw.",
    "City": "Stadt",
    "Postcode": "Postleitzahl",
    "StateProvince": "Bundesland / Provinz",
    "Country": "Land"
  },
  "en": {
    "Shopcart": "Shopping Cart",
    "Btcpayment": "Bitcoin Payment Method",
    "Quantity": "Quantity",
    "Remove": "Remove",
    "Ordertotal": "Order Total",
    "ContinueOrder": "Continue to order overview",
    "ContinuePay": "Continue to payment",
    "ContinueShop": "Continue Shopping",
    "ShippingAddress": "Shipping address",
    "FirstName": "First Name",
    "LastName": "Last Name",
    "Company": "Company",
    "Address": "Address",
    "Addition": "Apartment, suite, etc.",
    "City": "City",
    "Postcode": "Postal code",
    "StateProvince": "State / Province",
    "Country": "Country"
  },
  "es": {
    "Shopcart": "Carrito de Compras",
    "Btcpayment": "Método de Pago Bitcoin",
    "Quantity": "Cantidad",
    "Remove": "Eliminar",
    "Ordertotal": "Total del Pedido",
    "ContinueOrder": "Continuar al resumen del pedido",
    "ContinuePay": "Continuar al pago",
    "ContinueShop": "Continuar comprando",
    "ShippingAddress": "Dirección de Envío",
    "FirstName": "Nombre",
    "LastName": "Apellido",
    "Company": "Empresa",
    "Address": "Dirección",
    "Addition": "Apartamento, suite, etc.",
    "City": "Ciudad",
    "Postcode": "Código Postal",
    "StateProvince": "Estado / Provincia",
    "Country": "País"
  },
  "fr": {
    "Shopcart": "Chariot",
    "Btcpayment": "Méthode de Paiement Bitcoin",
    "Quantity": "Quantité",
    "Remove": "Retirer",
    "Ordertotal": "Total de la Commande",
    "ContinueOrder": "Continuer vers le résumé de la commande",
    "ContinuePay": "Continuer vers le paiement",
    "ContinueShop": "Continuer les achats",
    "ShippingAddress": "Adresse de livraison",
    "FirstName": "Prénom",
    "LastName": "Nom de famille",
    "Company": "Entreprise",
    "Address": "Adresse",
    "Addition": "Appartement, etc.",
    "City": "Ville",
    "Postcode": "Code Postal",
    "StateProvince": "État / Province",
    "Country": "Pays"
  },
  "nl": {
    "Shopcart": "Winkelwagen",
    "Btcpayment": "Bitcoin Betalingsmethode",
    "Quantity": "Hoeveelheid",
    "Remove": "Verwijderen",
    "Ordertotal": "Totaal van de Bestelling",
    "ContinueOrder": "Doorgaan naar besteloverzicht",
    "ContinuePay": "Doorgaan naar betalen",
    "ContinueShop": "Doorgaan met winkelen",
    "ShippingAddress": "Verzendadres",
    "FirstName": "Voornaam",
    "LastName": "Achternaam",
    "Company": "Bedrijf",
    "Address": "Adres",
    "Addition": "Appartement, Bus, etc.",
    "City": "Stad",
    "Postcode": "Postcode",
    "StateProvince": "Staat / Provincie",
    "Country": "Land"
  },
  "pt": {
    "Shopcart": "Carrinho de Compras",
    "Btcpayment": "Método de Pagamento Bitcoin",
    "Quantity": "Quantidade",
    "Remove": "Remover",
    "Ordertotal": "Total do Pedido",
    "ContinueOrder": "Continuar para o resumo do pedido",
    "ContinuePay": "Continuar para o pagamento",
    "ContinueShop": "Continuar comprando",
    "ShippingAddress": "Endereço de Envio",
    "FirstName": "Primeiro Nome",
    "LastName": "Último Nome",
    "Company": "Empresa",
    "Address": "Endereço",
    "Addition": "Apartamento, suíte, etc.",
    "City": "Cidade",
    "Postcode": "Código Postal",
    "StateProvince": "Estado / Província",
    "Country": "País"
  }
}
</i18n>

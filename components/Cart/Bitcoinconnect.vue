<template>
  <div
    class="bg-colorBgLight dark:bg-colorBgDark farm-grain-bg farm-checkout-shell"
    v-if="store.cartItems.length != 0"
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
              <div class="flex-shrink-0" v-if="product.image">
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

                      <h3 class="text-sm">
                        <a
                          class="font-medium text-2xl text-gray-700 hover:text-gray-800 dark:text-white"
                          >{{ product.variation }}</a
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
                      v-if="
                        filtersList == 'Fiat' &&
                        ticker.fiat.denomination != 'BTC'
                      "
                      class="text-right text-xl font-medium text-gray-900 dark:text-white"
                    >
                      {{ product.price }} {{ ticker.fiat.symbol }}
                    </p>

                    <p
                      v-if="
                        filtersList == 'Fiat' &&
                        ticker.fiat.denomination == 'BTC'
                      "
                      class="text-right text-xl font-medium text-gray-900 dark:text-white"
                    >
                      {{ (product.price * btcusdprices).toFixed(2) }} $
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
                      @click="
                        removeFromCart(
                          (id = product.id),
                          (variation = product.variation),
                        )
                      "
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
                    v-if="
                      filtersList == 'Fiat' && ticker.fiat.denomination != 'BTC'
                    "
                    class="text-right text-xl font-medium text-gray-900"
                  >
                    {{ totalPrice }} {{ ticker.fiat.symbol }}
                  </dd>

                  <dd
                    v-if="
                      filtersList == 'Fiat' && ticker.fiat.denomination == 'BTC'
                    "
                    class="text-right text-xl font-medium text-gray-900"
                  >
                    {{ (totalPrice * btcusdprices).toFixed(2) }} $
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- SHIPPING INFO -->

          <div
            class="px-4 pb-24 pt-16 sm:px-6 sm:pt-12 lg:px-8 lg:py-16 mt-4 farm-checkout-section"
          >
            <p class="mt-2 text-4xl font-bold tracking-tight">
              Delivery Options
            </p>

            <section aria-labelledby="shipping-heading" class="mt-10">
              <div class="text-center" v-if="data.checkout == 'full'">
                <button
                  v-if="data.checkout == 'full' || data.checkout == 'local'"
                  @click="toggleLocal"
                  class="px-4 my-4 py-2 font-semibold mr-6 farm-button-primary"
                >
                  📍 Local Pickup
                </button>
                <button
                  v-if="data.checkout == 'full' || data.checkout == 'ship'"
                  @click="toggleShipping"
                  class="px-4 my-4 py-2 font-semibold farm-button-primary"
                >
                  ⛴️ Shipping
                </button>
              </div>

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
                      {{ t("message") }}
                    </h3>
                    <div class="mt-2 text-sm text-red-700">
                      <ul role="list" class="list-disc space-y-1 pl-5">
                        <li>{{ t("instructions") }}</li>
                        <li>{{ t("required_fields") }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="isLocalVisible || data.checkout == 'local'"
                class="toggle-div"
              >
                <div
                  v-if="data.checkout == 'full' || data.checkout == 'local'"
                  class="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-4"
                >
                  <h2
                    id="shipping-heading"
                    class="text-lg font-medium text-gray-900 dark:text-white sm:col-span-4"
                  >
                    Local Pickup
                  </h2>

                  <div class="sm:col-span-2">
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-white"
                      >{{ data.localid }}</label
                    >
                    <div class="mt-1">
                      <input
                        v-model="localidentity"
                        type="text"
                        id=""
                        name=""
                        autocomplete=""
                        class="block w-full sm:text-sm farm-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="isShippingVisible || data.checkout == 'ship'"
                class="toggle-div"
              >
                <div
                  v-if="data.checkout == 'full' || data.checkout == 'ship'"
                  class="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-4"
                >
                  <h2
                    id="shipping-heading"
                    class="text-lg font-medium text-gray-900 dark:text-white sm:col-span-4"
                  >
                    {{ t("ShippingAddress") }}
                  </h2>

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
                      >{{ t("Email") }}</label
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
              </div>
            </section>

            <!-- END SHIPPING INFO -->

            <div
              class="mt-10"
              v-if="
                isLocalVisible !== false ||
                isShippingVisible !== false ||
                data.checkout !== 'full'
              "
            >
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
        <div class="mt-12"></div>
        <div class="" v-if="launchStep == 'view' || displaymode == true">
          <!-- ORDER OVERVIEW -->

          <div
            class="px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:py-16 rounded-3xl border-4 border-gray-600 mt-4"
          >
            <div class="mx-auto max-w-3xl">
              <div class="max-w-3xl">
                <h1 class="text-base font-medium farm-subtitle">
                  {{ t("thank_you_note") }}
                </h1>
                <p class="mt-2 text-4xl font-bold tracking-tight">
                  {{ t("order_overview") }}
                </p>
                <p class="mt-2 text-base text-gray-500 dark:text-white">
                  {{ t("order_number_instruction") }}{{ randomid }}
                  {{ t("confirmation_note") }}
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

                            <h3 class="text-sm">
                              <a
                                class="font-medium text-2xl text-gray-700 hover:text-gray-800 dark:text-white"
                                >{{ product.variation }}</a
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
                            v-if="
                              filtersList == 'Fiat' &&
                              ticker.fiat.denomination != 'BTC'
                            "
                            class="text-right text-xl font-medium text-gray-900 dark:text-white"
                          >
                            {{ product.price }} {{ ticker.fiat.symbol }}
                          </p>

                          <p
                            v-if="
                              filtersList == 'Fiat' &&
                              ticker.fiat.denomination == 'BTC'
                            "
                            class="text-right text-xl font-medium text-gray-900 dark:text-white"
                          >
                            {{ (product.price * btcusdprices).toFixed(2) }} $
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
                  <div v-if="isLocalVisible.value == false">
                    <h4 class="sr-only">Addresses</h4>
                    <dl class="grid grid-cols-2 gap-x-6 py-10 text-sm">
                      <div>
                        <dt class="font-medium text-gray-900 dark:text-white">
                          {{ t("shipping_address") }}
                        </dt>
                        <dd class="mt-2 text-gray-700 dark:text-white">
                          <address class="not-italic">
                            <span class="block">
                              {{ firstname }} {{ lastname }}</span
                            >
                            <span class="block"
                              >{{ company }} {{ email }}
                            </span>
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
                          {{ t("shipping_method") }}
                        </dt>
                        <dd class="mt-2 text-gray-700 dark:text-white">
                          <address class="not-italic">
                            <span class="block">{{
                              t("free_global_shipping")
                            }}</span>
                            <span class="block"
                              >{{ t("order_shipping_time") }}
                            </span>
                            <span class="block">{{ t("delivery_time") }}</span>
                          </address>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <h3 class="dark:text-white">{{ t("order_information") }}</h3>

                  <dl
                    class="space-y-6 border-t border-gray-200 dark:text-white pt-10 text-sm"
                  >
                    <div class="flex justify-between">
                      <dt class="font-medium text-gray-900 dark:text-white">
                        {{ t("timestamp") }}
                      </dt>
                      <dd class="text-gray-700 dark:text-white">
                        {{ Date.now() }}
                      </dd>
                    </div>

                    <div class="flex justify-between">
                      <dt class="font-medium text-gray-900 dark:text-white">
                        {{ t("order_id") }}
                      </dt>
                      <dd class="text-gray-700 dark:text-white">
                        #{{ randomid }}
                      </dd>
                    </div>

                    <div class="flex justify-between">
                      <dt class="font-medium text-gray-900 dark:text-white">
                        {{ t("current_btc_price") }}
                      </dt>
                      <dd class="text-gray-700 dark:text-white">
                        {{ fiatToUsdRate.toFixed(2) }}
                        {{ ticker.fiat.symbol }}
                      </dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="font-medium text-gray-900 dark:text-white">
                        {{ t("total_bitcoin_price") }}
                      </dt>
                      <dd class="text-gray-700 dark:text-white">
                        {{ (totalPrice * btcprices).toFixed(8) }}
                        <BitcoinIcon
                          class="h-6 w-6 inline -mt-1"
                          aria-hidden="true"
                        />
                      </dd>
                    </div>

                    <div
                      v-if="isLocalVisible == false"
                      class="flex justify-between"
                    >
                      <dt class="font-medium text-gray-900 dark:text-white">
                        Shipping Cost
                      </dt>
                      <dd class="text-gray-700 dark:text-white">
                        {{ (totalShipPrice * btcprices).toFixed(8) }}
                        <BitcoinIcon
                          class="h-6 w-6 inline -mt-1"
                          aria-hidden="true"
                        />
                      </dd>
                    </div>

                    <div
                      v-if="isLocalVisible == false"
                      class="flex justify-between"
                    >
                      <dt class="font-medium text-gray-900 dark:text-white">
                        Total Order BTC
                      </dt>
                      <dd class="text-gray-900 dark:text-white">
                        {{
                          ((totalPrice + totalShipPrice) * btcprices).toFixed(8)
                        }}
                        <BitcoinIcon
                          class="h-6 w-6 inline -mt-1"
                          aria-hidden="true"
                        />
                      </dd>
                    </div>

                    <div class="flex justify-between">
                      <dt class="font-medium text-gray-900 dark:text-white">
                        {{ t("total_approximate_in_fiat") }}
                      </dt>
                      <dd
                        class="text-gray-900 dark:text-white"
                        v-if="ticker.fiat.denomination != 'BTC'"
                      >
                        {{ totalPrice.toFixed(2) }} {{ ticker.fiat.symbol }}
                      </dd>
                      <dd
                        class="text-gray-900 dark:text-white"
                        v-if="ticker.fiat.denomination == 'BTC'"
                      >
                        {{ (totalPrice * btcusdprices).toFixed(2) }} $
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>
            </div>

            <div class="mt-10" v-if="!payswitch">
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

            <div class="mt-10 text-center" v-if="payswitch">
              <Bcbutton
                :invoice="invoice"
                :preimage="preimage"
                class="mx-auto"
              />
            </div>
          </div>

          <!-- END ORDER OVERVIEW -->
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center mt-12">
    <p class="uppercase text-3xl">{{ t("Emptycart") }}</p>

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

const isLocalVisible = ref(false);
const isShippingVisible = ref(false);

const toggleLocal = () => {
  isLocalVisible.value = true;
  isShippingVisible.value = false;
};

const toggleShipping = () => {
  isShippingVisible.value = true;
  isLocalVisible.value = false;
};

const launchStep = ref("");

const randomid = ref("");

const cartStore = useProjectStore();
const { removeFromCart } = cartStore;
const { cartItems } = storeToRefs(cartStore);

// console.log(cartItems);

const localidentity = ref("");

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
const btcusdprices = rates.usdPerBtc.toFixed(2);
const btcprices = rates.btcPerFiat;
const fiatToUsdRate = rates.fiatToUsd;

const store = useProjectStore();
const getCartTotal = () => Number(store.getTotalPrice?.() ?? 0) || 0;
const getCartShippingTotal = () =>
  Number(store.getTotalShippingCost?.() ?? 0) || 0;
const calculateTotalPriceBtc = (includeShipping) => {
  const fiatTotal = includeShipping
    ? getCartTotal() + getCartShippingTotal()
    : getCartTotal();
  return (fiatTotal * btcprices).toFixed(8);
};

const totalPrice = ref(getCartTotal());
const totalShipPrice = ref(getCartShippingTotal());
const orderDispatchState = ref("");
const orderDispatchMessage = ref("");

// const totalPriceSats = (totalPrice * btcprices * 100000000).toFixed(0);
const totalPriceBtc = ref(0);

function hasEmptyItem(array) {
  return array.some((item) => !item);
}

function orderView() {
  if (isLocalVisible.value == true || data.checkout == "local") {
    if (localidentity.value !== "") {
      launchStep.value = "view";
      if (isShippingVisible.value == true) {
        totalPriceBtc.value = calculateTotalPriceBtc(true);
      } else {
        totalPriceBtc.value = calculateTotalPriceBtc(false);
      }

      window.scrollTo(0, 0);
    } else {
      missingInfo.value = true;
    }
  } else {
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
      if (isShippingVisible.value == true) {
        totalPriceBtc.value = calculateTotalPriceBtc(true);
      } else {
        totalPriceBtc.value = calculateTotalPriceBtc(false);
      }
      window.scrollTo(0, 0);
    }
  }
}

import { LightningAddress } from "@getalby/lightning-tools";
const invoice = ref("");
const preimage = ref("");
const payswitch = ref(false);

async function paymentstart() {
  payswitch.value = true;
  const includeShipping = isShippingVisible.value == true;

  // Declare local variable to hold invoice object
  let lightningInvoice;

  if (isShippingVisible.value == true) {
    totalPriceBtc.value = calculateTotalPriceBtc(true);

    const ln = new LightningAddress(ticker.lightningaddress);
    await ln.fetch();
    lightningInvoice = await ln.requestInvoice({
      satoshi: (totalPriceBtc.value * 100000000).toFixed(0),
    });
    invoice.value = lightningInvoice.paymentRequest;
  } else {
    totalPriceBtc.value = calculateTotalPriceBtc(false);

    const ln = new LightningAddress(ticker.lightningaddress);
    await ln.fetch();
    lightningInvoice = await ln.requestInvoice({
      satoshi: (totalPriceBtc.value * 100000000).toFixed(0),
    });
    invoice.value = lightningInvoice.paymentRequest;
  }

  console.log(`Invoice: ${lightningInvoice.paymentRequest}`);
  console.log(`Payment hash: ${lightningInvoice.paymentHash}`);

  // Check every few seconds to see if the invoice is paid
  const checkPaymentInterval = setInterval(async () => {
    const paid = await lightningInvoice.verifyPayment();
    if (paid && lightningInvoice.preimage) {
      console.log(`Preimage: ${lightningInvoice.preimage}`);
      preimage.value = lightningInvoice.preimage;
      clearInterval(checkPaymentInterval);
    }
  }, 3000);

  // SENDING OFF THE DATA
  const orderMessage = buildOrderMessage({
    orderId: randomid.value,
    checkoutMode: includeShipping ? "shipping" : "local",
    customer: {
      name: `${firstname.value} ${lastname.value}`.trim(),
      email: email.value,
      address: address.value,
      apartment: apartment.value,
      city: city.value,
      postalcode: postalcode.value,
      region: region.value,
      country: country.value,
      localidentity: localidentity.value,
    },
    items: store.cartItems,
    totals: {
      subtotalFiat: Number(totalPrice.value || 0),
      shippingFiat: includeShipping ? Number(totalShipPrice.value || 0) : 0,
      totalFiat: includeShipping
        ? Number(totalPrice.value || 0) + Number(totalShipPrice.value || 0)
        : Number(totalPrice.value || 0),
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
    totalShipPrice.value = getCartShippingTotal();

    // totalPriceBtc.value = (store.getTotalPrice() * btcprices).toFixed(8)
  },
  { deep: true },
);

// watch(() => store.cartItems, () => {
//   totalPriceBtc.value = (store.getTotalPrice() * btcprices).toFixed(8)
// }, { deep: true });

// watch(ordercheck, (newValue) => {
//   console.log('Checkbox state is now:', newValue);
// });

onMounted(() => {
  totalPrice.value = getCartTotal();
  totalShipPrice.value = getCartShippingTotal();
  // totalPriceBtc.value = (store.getTotalPrice() * btcprices).toFixed(8)
  randomid.value = randomId(10);
  // console.log(randomId(10));
  console.log(store.cartItems);
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
    "Country": "Land",
    "message": "Forsendelsesinformationen mangler nogle input! 👀",
    "instructions": "Sørg for, at følgende felter er korrekt udfyldt.",
    "required_fields": "Fornavn & Efternavn, Emailadresse og Geografisk adresse 🌎",
    "thank_you_note": "Tak fordi du overvejer at bestille ting!",
    "order_overview": "Ordreoversigt!",
    "order_number_instruction": "Din ordre #",
    "confirmation_note": "Bekræft venligst alle detaljer, opdatering vil ikke være mulig. Tag et skærmbillede af ordreinformationen og sørg for, at din betaling nævner ordrenummeret!",
    "agreement_instruction": "Du skal acceptere vores forsendelses- og servicevilkår ved at klikke på afkrydsningsfeltet nederst.",
    "shipping_address": "Forsendelsesadresse",
    "shipping_method": "Forsendelsesmetode",
    "free_global_shipping": "Gratis global forsendelse",
    "order_shipping_time": "Ordre afsendes op til 7 dage",
    "delivery_time": "Leveringstid: 5 arbejdsdage",
    "order_information": "Ordreinformation",
    "timestamp": "Tidsstempel",
    "order_id": "Ordre ID",
    "current_btc_price": "Aktuel BTC-pris",
    "total_bitcoin_price": "Total Bitcoin-pris",
    "total_approximate_in_fiat": "Samlet omtrentlig værdi i fiat",
    "confirmation_agreement": "Jeg bekræfter, at ovenstående oplysninger er korrekte og accepterer forsendelses- og servicevilkårene",
    "payment_instructions": "Vælg din betalingsmetode for at afslutte din ordre.",
    "final_thank_you_note": "Tak fordi du bestilte ting 🎉!",
    "order_registered_note": "Din ordre med id er registreret, for at afslutte din ordre bedes du fortsætte med at vælge onchain eller lightning betaling. Når betalingen er verificeret, vil vi sende din ordre hurtigst muligt.",
    "Email": "Lightning Address",
    "confirmation_note": "Jeg bekræfter, at ovenstående oplysninger er korrekte og accepterer",
    "shipping": "forsendelse",
    "TOS": "TOS",
    "Your_id": "Din ordre med id",
    "finalregister": "er blevet registreret, for at afslutte din ordre bedes du fortsætte med at vælge onchain eller lightning betaling. Når betalingen er verificeret, vil vi sende din ordre hurtigst muligt.",
    "Emptycart": "Det ser ud til, at du ikke har nogen varer i din indkøbskurv"
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
    "Country": "Land",
    "message": "Die Versandinformationen fehlen einige Eingaben! 👀",
    "instructions": "Bitte stellen Sie sicher, dass die folgenden Felder korrekt ausgefüllt sind.",
    "required_fields": "Vor- und Nachname, E-Mail-Adresse und geografische Adresse 🌎",
    "thank_you_note": "Danke, dass Sie erwägen, Dinge zu bestellen!",
    "order_overview": "Bestellübersicht!",
    "order_number_instruction": "Ihre Bestellung #",
    "confirmation_note": "Bitte bestätigen Sie alle Details, eine Aktualisierung wird nicht möglich sein. Machen Sie einen Screenshot der Bestellinformationen und stellen Sie sicher, dass Ihre Zahlung die Bestellnummer enthält!",
    "agreement_instruction": "Sie müssen unseren Versand- und Nutzungsbedingungen zustimmen, indem Sie das Kontrollkästchen unten anklicken.",
    "shipping_address": "Lieferadresse",
    "shipping_method": "Versandart",
    "free_global_shipping": "Kostenloser weltweiter Versand",
    "order_shipping_time": "Bestellung wird bis zu 7 Tagen versendet",
    "delivery_time": "Lieferzeit: 5 Werktage",
    "order_information": "Bestellinformationen",
    "timestamp": "Zeitstempel",
    "order_id": "Bestell-ID",
    "current_btc_price": "Aktueller BTC-Preis",
    "total_bitcoin_price": "Gesamt-Bitcoin-Preis",
    "total_approximate_in_fiat": "Gesamtsumme ungefähr in Fiat",
    "confirmation_agreement": "Ich bestätige, dass die obigen Informationen korrekt sind und stimme den Versandbedingungen zu",
    "payment_instructions": "Wählen Sie Ihre Zahlungsmethode, um Ihre Bestellung abzuschließen.",
    "final_thank_you_note": "Vielen Dank für Ihre Bestellung 🎉!",
    "order_registered_note": "Ihre Bestellung mit der ID wurde registriert, um Ihre Bestellung abzuschließen, wählen Sie bitte Onchain- oder Lightning-Zahlung. Sobald die Zahlung bestätigt ist, versenden wir Ihre Bestellung so schnell wie möglich.",
    "Email": "Lightning Address",
    "I confirm the above information is correct and agree with the": "Ich bestätige, dass die obigen Informationen korrekt sind und stimme",
    "shipping": "dem Versand",
    "TOS": "TOS zu",
    "Your_id": "Ihre Bestellung mit der ID",
    "finalregister": "wurde registriert, um Ihre Bestellung abzuschließen, wählen Sie bitte Onchain- oder Lightning-Zahlung. Sobald die Zahlung bestätigt ist, versenden wir Ihre Bestellung so schnell wie möglich.",
    "Emptycart": "Es scheint, als hätten Sie keine Artikel in Ihrem Warenkorb"
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
    "Country": "Country",
    "message": "The shipping information is missing some input! 👀",
    "instructions": "Please make sure the following fields are correctly filled in.",
    "required_fields": "First & Last name, Email address and Geographic Address 🌎",
    "thank_you_note": "Thank you for considering ordering stuff!",
    "order_overview": "Order Overview!",
    "order_number_instruction": "Your order #",
    "confirmation_note": "Please confirm all details, updating won't be possible. Take a screenshot of the order information and make sure your payment mentions the order id!",
    "agreement_instruction": "You have to agree with our shipping and terms of service by clicking the checkbox at the bottom.",
    "shipping_address": "Shipping address",
    "shipping_method": "Shipping method",
    "free_global_shipping": "Free Global Shipping",
    "order_shipping_time": "Order ships out up to 7 days",
    "delivery_time": "Delivery time: 5 working days",
    "order_information": "Order information",
    "timestamp": "Timestamp",
    "order_id": "Order ID",
    "current_btc_price": "Current BTC Price",
    "total_bitcoin_price": "Total Bitcoin Price",
    "total_approximate_in_fiat": "Total Approximate in Fiat",
    "confirmation_agreement": "I confirm the above information is correct and agree with the shipping TOS",
    "payment_instructions": "Choose your payment method to finish your order.",
    "final_thank_you_note": "Thank you for ordering stuff 🎉!",
    "order_registered_note": "Your order with id has been registered, to finish your order please continue by choosing onchain or lightning payment. Once payment has been verified we will ship your order as soon as possible.",
    "Email": "Lightning Address",
    "I confirm the above information is correct and agree with the": "I confirm the above information is correct and agree with the",
    "shipping": "shipping",
    "TOS": "TOS",
    "Your_id": "Your order with id",
    "finalregister": "has been registered, to finish your order please continue by choosing onchain or lightning payment. Once payment has been verified we will ship your order as soon as possible.",
    "Emptycart": "It seems like you have no items in your shopping cart"
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
    "Country": "País",
    "message": "¡Faltan algunos datos en la información de envío! 👀",
    "instructions": "Por favor, asegúrese de que los siguientes campos están correctamente llenados.",
    "required_fields": "Nombre y Apellido, Dirección de correo electrónico y Dirección geográfica 🌎",
    "thank_you_note": "¡Gracias por considerar ordenar cosas!",
    "order_overview": "Resumen del Pedido!",
    "order_number_instruction": "Tu pedido #",
    "confirmation_note": "Por favor confirme todos los detalles, no será posible actualizar. Tome una captura de pantalla de la información del pedido y asegúrese de que su pago mencione el número de pedido.",
    "agreement_instruction": "Debe aceptar nuestros términos y condiciones de envío marcando la casilla al final.",
    "shipping_address": "Dirección de Envío",
    "shipping_method": "Método de Envío",
    "free_global_shipping": "Envío Global Gratis",
    "order_shipping_time": "El pedido se envía en hasta 7 días",
    "delivery_time": "Tiempo de entrega: 5 días laborables",
    "order_information": "Información del pedido",
    "timestamp": "Marca temporal",
    "order_id": "ID de Pedido",
    "current_btc_price": "Precio actual de BTC",
    "total_bitcoin_price": "Precio total en Bitcoin",
    "total_approximate_in_fiat": "Total aproximado en Fiat",
    "confirmation_agreement": "Confirmo que la información anterior es correcta y estoy de acuerdo con los términos de envío",
    "payment_instructions": "Elija su método de pago para finalizar su pedido.",
    "final_thank_you_note": "¡Gracias por ordenar cosas 🎉!",
    "order_registered_note": "Su pedido con id ha sido registrado, para finalizar su pedido, por favor continúe eligiendo el pago onchain o lightning. Una vez verificado el pago, enviaremos su pedido lo antes posible.",
    "Email": "Lightning Address",
    "I confirm the above information is correct and agree with the": "Confirmo que la información anterior es correcta y estoy de acuerdo con",
    "shipping": "el envío",
    "TOS": "TOS",
    "Your_id": "Su pedido con id",
    "finalregister": "ha sido registrado, para finalizar su pedido, por favor continúe eligiendo el pago onchain o lightning. Una vez verificado el pago, enviaremos su pedido lo antes posible.",
    "Emptycart": "Parece que no tienes artículos en tu carrito de compras"
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
    "Country": "Pays",
    "message": "Il manque des informations de livraison ! 👀",
    "instructions": "Veuillez vous assurer que les champs suivants sont correctement remplis.",
    "required_fields": "Prénom & Nom, Adresse e-mail et Adresse géographique 🌎",
    "thank_you_note": "Merci de considérer commander des articles!",
    "order_overview": "Résumé de la Commande!",
    "order_number_instruction": "Votre commande #",
    "confirmation_note": "Veuillez confirmer tous les détails, la mise à jour ne sera pas possible. Prenez une capture d'écran des informations de la commande et assurez-vous que votre paiement mentionne le numéro de commande!",
    "agreement_instruction": "Vous devez accepter nos conditions de livraison et d'utilisation en cliquant sur la case en bas.",
    "shipping_address": "Adresse de livraison",
    "shipping_method": "Méthode d'expédition",
    "free_global_shipping": "Livraison Mondiale Gratuite",
    "order_shipping_time": "Commande expédiée en jusqu'à 7 jours",
    "delivery_time": "Délai de livraison : 5 jours ouvrables",
    "order_information": "Informations de la commande",
    "timestamp": "Horodatage",
    "order_id": "ID de la commande",
    "current_btc_price": "Prix actuel du BTC",
    "total_bitcoin_price": "Prix total en Bitcoin",
    "total_approximate_in_fiat": "Total approximatif en Fiat",
    "confirmation_agreement": "Je confirme que les informations ci-dessus sont correctes et j'accepte les conditions de livraison",
    "payment_instructions": "Choisissez votre méthode de paiement pour terminer votre commande.",
    "final_thank_you_note": "Merci d'avoir commandé des articles 🎉!",
    "order_registered_note": "Votre commande avec l'ID a été enregistrée, pour finaliser votre commande, veuillez continuer en choisissant le paiement onchain ou lightning. Une fois le paiement vérifié, nous expédierons votre commande dès que possible.",
    "Email": "Lightning Address",
    "I confirm the above information is correct and agree with the": "Je confirme que les informations ci-dessus sont correctes et j'accepte",
    "shipping": "les conditions de livraison",
    "TOS": "TOS",
    "Your_id": "Votre commande avec l'ID",
    "finalregister": "a été enregistrée, pour finaliser votre commande, veuillez continuer en choisissant le paiement onchain ou lightning. Une fois le paiement vérifié, nous expédierons votre commande dès que possible.",
    "Emptycart": "Il semble que vous n'avez aucun article dans votre panier"
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
    "Country": "Land",
    "message": "De verzendinformatie mist wat invoer! 👀",
    "instructions": "Zorg ervoor dat de volgende velden correct zijn ingevuld.",
    "required_fields": "Voor- en Achternaam, E-mailadres en Geografisch Adres 🌎",
    "thank_you_note": "Bedankt voor het overwegen om dingen te bestellen!",
    "order_overview": "Bestellingsoverzicht!",
    "order_number_instruction": "Je bestelling #",
    "confirmation_note": "Bevestig alle details alstublieft, bijwerken zal niet mogelijk zijn. Maak een screenshot van de bestelgegevens en zorg ervoor dat uw betaling het bestelnummer vermeldt!",
    "agreement_instruction": "Je moet akkoord gaan met onze verzend- en servicevoorwaarden door op het vakje onderaan te klikken.",
    "shipping_address": "Verzendadres",
    "shipping_method": "Verzendmethode",
    "free_global_shipping": "Gratis Wereldwijde Verzending",
    "order_shipping_time": "Bestelling wordt verzonden tot 7 dagen",
    "delivery_time": "Levertijd: 5 werkdagen",
    "order_information": "Bestelinformatie",
    "timestamp": "Tijdstempel",
    "order_id": "Bestel ID",
    "current_btc_price": "Huidige BTC-prijs",
    "total_bitcoin_price": "Totale Bitcoin-prijs",
    "total_approximate_in_fiat": "Totale geschatte waarde in Fiat",
    "confirmation_agreement": "Ik bevestig dat bovenstaande informatie correct is en ga akkoord met de verzendvoorwaarden",
    "payment_instructions": "Kies uw betaalmethode om uw bestelling af te ronden.",
    "final_thank_you_note": "Bedankt voor het bestellen van dingen 🎉!",
    "order_registered_note": "Je bestelling met id is geregistreerd, om je bestelling af te ronden, ga je verder door te kiezen voor onchain- of lightningbetaling. Zodra de betaling is geverifieerd, verzenden we je bestelling zo snel mogelijk.",
    "Email": "Lightning Address",
    "I confirm the above information is correct and agree with the": "Ik bevestig dat bovenstaande informatie correct is en ga akkoord met de",
    "shipping": "verzendvoorwaarden",
    "TOS": "TOS",
    "Your_id": "Je bestelling met id",
    "finalregister": "is geregistreerd, om je bestelling af te ronden, ga verder door te kiezen voor onchain- of lightningbetaling. Zodra de betaling is geverifieerd, verzenden we je bestelling zo snel mogelijk.",
    "Emptycart": "Het lijkt erop dat je geen items in je winkelwagen hebt"
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
    "ShippingAddress": "Endereço de Entrega",
    "FirstName": "Primeiro Nome",
    "LastName": "Último Nome",
    "Company": "Empresa",
    "Address": "Endereço",
    "Addition": "Apartamento, suíte, etc.",
    "City": "Cidade",
    "Postcode": "Código Postal",
    "StateProvince": "Estado / Província",
    "Country": "País",
    "message": "Faltam alguns dados na informação de envio! 👀",
    "instructions": "Por favor, certifique-se de que os seguintes campos estão corretamente preenchidos.",
    "required_fields": "Nome e Sobrenome, Endereço de Email e Endereço Geográfico 🌎",
    "thank_you_note": "Obrigado por considerar encomendar coisas!",
    "order_overview": "Resumo do Pedido!",
    "order_number_instruction": "Seu pedido #",
    "confirmation_note": "Por favor, confirme todos os detalhes, a atualização não será possível. Tire uma captura de tela das informações do pedido e certifique-se de que seu pagamento mencione o número do pedido!",
    "agreement_instruction": "Você deve concordar com nossos termos de envio e de serviço clicando na caixa de seleção na parte inferior.",
    "shipping_address": "Endereço de Entrega",
    "shipping_method": "Método de Envio",
    "free_global_shipping": "Frete Grátis Global",
    "order_shipping_time": "Pedido enviado em até 7 dias",
    "delivery_time": "Tempo de entrega: 5 dias úteis",
    "order_information": "Informações do Pedido",
    "timestamp": "Registro de data e hora",
    "order_id": "ID do Pedido",
    "current_btc_price": "Preço atual do BTC",
    "total_bitcoin_price": "Preço Total em Bitcoin",
    "total_approximate_in_fiat": "Total Aproximado em Fiat",
    "confirmation_agreement": "Confirmo que as informações acima estão corretas e concordo com os termos de envio",
    "payment_instructions": "Escolha seu método de pagamento para finalizar seu pedido.",
    "final_thank_you_note": "Obrigado por encomendar coisas 🎉!",
    "order_registered_note": "Seu pedido com id foi registrado, para finalizar seu pedido por favor continue escolhendo pagamento onchain ou lightning. Assim que o pagamento for verificado, enviaremos seu pedido o mais rápido possível.",
    "Email": "Lightning Address",
    "I confirm the above information is correct and agree with the": "Confirmo que as informações acima estão corretas e concordo com os",
    "shipping": "termos de envio",
    "TOS": "TOS",
    "Your_id": "Seu pedido com id",
    "finalregister": "foi registrado, para finalizar seu pedido por favor continue escolhendo pagamento onchain ou lightning. Assim que o pagamento for verificado, enviaremos seu pedido o mais rápido possível.",
    "Emptycart": "Parece que você não tem itens no seu carrinho de compras"
  }
}
</i18n>

/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as tf from '@tensorflow/tfjs';
import {Scalar, Tensor} from '@tensorflow/tfjs';
import {FederatedModel, ModelDict} from '../src/index';

const audioTransferLearningModelURL =
    // tslint:disable-next-line:max-line-length
    'https://storage.googleapis.com/tfjs-speech-command-model-14w/model.json';

export class AudioTransferLearningModel implements FederatedModel {
  async setup(): Promise<ModelDict> {
    const model = await tf.loadModel(audioTransferLearningModelURL);

    for (let i = 0; i < 9; ++i) {
      model.layers[i].trainable = false;  // freeze conv layers
    }

    const loss = (inputs: Tensor, labels: Tensor) => {
      const logits = model.predict(inputs) as Tensor;
      const losses = tf.losses.softmaxCrossEntropy(logits, labels);
      return losses.mean() as Scalar;
    };

    return {predict: model.predict, vars: model.trainableWeights, loss};
  }
}

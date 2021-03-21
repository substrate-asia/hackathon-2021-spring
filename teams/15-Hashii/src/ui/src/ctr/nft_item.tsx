/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2019, hardchain
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of hardchain nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL hardchain BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

import { ViewController, React } from 'webpkit';

export default class extends ViewController {

	renderItem() {
		return (
			<div className="collectible-card col-sm-6 col-md-4">
				<a href="https://superrare.co/artwork-v2/ultra-solem-17573">
					<section className="md-media md-media--1-1">
						<div>
							<div>
								<div className="new-grid-img" style={{ width: '640px', height: '360px' }}>
									<video src="https://ipfs.pixura.io/ipfs/QmSvZR32rfCDaKAPweFNa6ik8zoFkaGcMB5KYRNLgVMCwN/ultra-solem.mp4" preload="auto" autoPlay={true} loop={true} playsInline={true} webkit-playsinline="" x5-playsinline="" style={{ width: '100%', height: '100%' }}></video>
								</div>
							</div>
						</div>
					</section>
				</a>
				<div className="collectible-card__info-container">
					<div className="collectible-card__first-section" style={{ width: '95%' }}>
						<a className="collectible-card__name" href="https://superrare.co/artwork-v2/ultra-solem-17573">Ultra Solem</a>
					</div>

					<div className="collectible-card__price-item-container">

						<div className="collectible-card__price-item">
							<a className="collectible-card__price-number" href="https://superrare.co/artwork-v2/ultra-solem-17573">
								<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									<span>1.288</span>
									<span className="eth-symbol" style={{ fontSize: '15px' }}>Ξ</span> ($
									<span>728</span>)
								</div>
							</a>
							<p className="collectible-card__price-text ">List price</p>
						</div>

						<div className="collectible-card__price-item">
							<a className="collectible-card__price-number" href="https://superrare.co/artwork-v2/ultra-solem-17573">
								<span>0.7</span>
								<span className="eth-symbol" style={{ fontSize: '15px' }}>Ξ</span> 
								($<span>408</span>)
							</a>
							<p className="collectible-card__price-text">Current offer by<a className="collectible-card__price-username" href="https://superrare.co/collin2">@collin2</a>
							</p>
						</div>

					</div>

					<div className="collectible-card__user-section" style={{ visibility: 'visible', display: 'none' }}>
						<hr className="collectible-card__user-section-divider" />
						<div className="collectible-card__user-container">
							<div className="collectible-card__user-item">
								<div className="collectible-card__user-title"> ARTIST </div>
								<a className="user" href="https://superrare.co/garycartlidge">
									<div className="md-inline-block md-avatar md-avatar--default user__avatar">
										<img src="/test/tmp/Market _ SuperRare_files/QmYvnX9ZMFGf1XxmNi42G3BUXanYKDfu9BvZK9o4QusGva" className="md-avatar-img" />
									</div>
									<div className="user__username"> garycartlidge </div>
								</a>
							</div>
							<div className="collectible-card__user-item">
								<div className="collectible-card__user-title">
									OWNER
								</div>
								<a className="user" href="https://superrare.co/garycartlidge">
									<div className="md-inline-block md-avatar md-avatar--default user__avatar">
										<img src="/test/tmp/Market _ SuperRare_files/QmYvnX9ZMFGf1XxmNi42G3BUXanYKDfu9BvZK9o4QusGva" className="md-avatar-img" />
									</div>
									<div className="user__username">
										garycartlidge
									</div>
								</a>
							</div>
						</div>
					</div>

				</div>
			</div>
		);
	}

	render() {
		return this.renderItem();
	}

}